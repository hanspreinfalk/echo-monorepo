import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { createClerkClient } from "@clerk/backend";
import { PRO_PRICE_CENTS } from "./pricing";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!
});

function getSubscriptionPeriodBounds(subscription: Stripe.Subscription): {
    start: number;
    end: number;
} | null {
    const item = subscription.items?.data?.[0];
    if (
        item &&
        typeof item.current_period_start === "number" &&
        typeof item.current_period_end === "number"
    ) {
        return {
            start: item.current_period_start,
            end: item.current_period_end,
        };
    }
    return null;
}

export const pay = action({
    args: {
        plan: v.union(
            v.literal('free'),
            v.literal('pro'),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const subscription = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
            organizationId: orgId,
        });

        if (subscription && subscription.status === 'active') {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Subscription already exists",
            });
        }

        if (args.plan !== "pro") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Checkout is only available for the Pro plan",
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const baseUrl = process.env.BASE_URL!;

        const amountCents = PRO_PRICE_CENTS;

        // Reuse an existing Stripe customer when the org has subscribed before,
        // otherwise pre-fill the checkout form with the user's email.
        const customerParam: Pick<Stripe.Checkout.SessionCreateParams, 'customer' | 'customer_email'> =
            subscription?.stripeCustomerId
                ? { customer: subscription.stripeCustomerId }
                : { customer_email: identity.email };

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            locale: 'en',
            mode: 'subscription',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Pro Subscription',
                            description: 'Access to all features',
                        },
                        unit_amount: amountCents,
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1,
                }
            ],
            ...customerParam,
            metadata: {
                orgId,
                plan: args.plan,
                currency: 'usd',
                amount: String(amountCents),
            },
            subscription_data: {
                metadata: {
                    orgId,
                    plan: args.plan,
                    currency: 'usd',
                    amount: String(amountCents),
                },
            },
            success_url: `${baseUrl}/billing?success=true`,
            cancel_url: `${baseUrl}/billing?cancel=true`,
        };

        const session: Stripe.Response<Stripe.Checkout.Session> = await stripe.checkout.sessions.create(sessionConfig);
        return session.url;
    }
})

export const fulfill = internalAction({
    args: {
        signature: v.string(),
        payload: v.string(),
    },
    handler: async ({ runQuery, runMutation }, { signature, payload }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

        if (!webhookSecret) {
            return {
                success: false,
                error: 'Webhook secret not configured',
            };
        }

        if (!signature) {
            return {
                success: false,
                error: 'Missing signature',
            };
        }

        if (!payload) {
            return {
                success: false,
                error: 'Empty payload',
            };
        }

        try {
            const event = await stripe.webhooks.constructEventAsync(
                payload,
                signature,
                webhookSecret
            );
            console.log("Webhook verified successfully, event type:", event.type);

            if (event.type === 'customer.subscription.created') {
                const subscription = event.data.object as Stripe.Subscription;
                const orgId = subscription.metadata?.orgId;
                const plan = subscription.metadata?.plan;

                console.log("[stripe] subscription.created — sub:", subscription.id, "orgId:", orgId, "plan:", plan, "status:", subscription.status);

                if (!orgId) {
                    return { success: false, error: "Missing organization ID in subscription metadata" };
                }

                if (plan !== "pro") {
                    return { success: false, error: "Invalid plan in subscription metadata" };
                }

                const period = getSubscriptionPeriodBounds(subscription);
                console.log("[stripe] subscription.created — period:", period);
                if (!period) {
                    return { success: false, error: "Could not read subscription billing period" };
                }

                await Promise.all([
                    stripe.subscriptions.update(subscription.id, { description: plan }),
                    clerkClient.organizations.updateOrganization(orgId, { maxAllowedMemberships: 5 }),
                ]);

                await runMutation(internal.system.subscriptions.upsert, {
                    organizationId: orgId,
                    stripeCustomerId: subscription.customer as string,
                    stripeSubscriptionId: subscription.id,
                    startDate: period.start * 1000,
                    endDate: period.end * 1000,
                    plan: "pro",
                    status: "active",
                });

                console.log("[stripe] subscription.created — DB record upserted for org:", orgId);
            }

            if (event.type === 'customer.subscription.updated') {
                const subscription = event.data.object as Stripe.Subscription;

                console.log("[stripe] subscription.updated — sub:", subscription.id, "status:", subscription.status, "cancel_at_period_end:", subscription.cancel_at_period_end, "cancel_at:", subscription.cancel_at);

                const dbSubscription = await runQuery(
                    internal.system.subscriptions.getByStripeSubscriptionId,
                    { stripeSubscriptionId: subscription.id },
                );

                if (!dbSubscription) {
                    console.error("[stripe] subscription.updated — no DB record found for sub:", subscription.id);
                    return { success: false, error: "Subscription not found for update event" };
                }

                const stripeToStatus = {
                    active: 'active',
                    past_due: 'past_due',
                    unpaid: 'unpaid',
                    incomplete_expired: 'expired',
                    trialing: 'active',
                } as const;

                type OurStatus = 'active' | 'past_due' | 'unpaid' | 'expired';
                const newStatus: OurStatus | undefined =
                    stripeToStatus[subscription.status as keyof typeof stripeToStatus];

                const period = getSubscriptionPeriodBounds(subscription);

                let cancelAt: number | undefined = undefined;
                if (subscription.cancel_at != null) {
                    cancelAt = subscription.cancel_at * 1000;
                } else if (subscription.cancel_at_period_end && period) {
                    cancelAt = period.end * 1000;
                }

                console.log("[stripe] subscription.updated — newStatus:", newStatus, "period:", period, "cancelAt (ms):", cancelAt);

                await Promise.all([
                    newStatus
                        ? runMutation(internal.system.subscriptions.updateStatus, {
                              organizationId: dbSubscription.organizationId,
                              status: newStatus,
                          })
                        : Promise.resolve(),
                    period
                        ? runMutation(internal.system.subscriptions.updateEndDate, {
                              organizationId: dbSubscription.organizationId,
                              endDate: period.end * 1000,
                          })
                        : Promise.resolve(),
                    runMutation(internal.system.subscriptions.updateCancelAt, {
                        organizationId: dbSubscription.organizationId,
                        cancelAt,
                    }),
                ]);

                console.log("[stripe] subscription.updated — done for org:", dbSubscription.organizationId);
            }

            if (event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object as Stripe.Subscription;

                console.log("[stripe] subscription.deleted — sub:", subscription.id, "metadata orgId:", subscription.metadata?.orgId);

                let orgId: string | undefined = subscription.metadata?.orgId;

                if (!orgId) {
                    const dbSubscription = await runQuery(
                        internal.system.subscriptions.getByStripeSubscriptionId,
                        { stripeSubscriptionId: subscription.id },
                    );
                    if (dbSubscription?.organizationId) {
                        orgId = dbSubscription.organizationId;
                    }
                    console.log("[stripe] subscription.deleted — resolved orgId from DB:", orgId);
                }

                if (!orgId) {
                    return { success: false, error: 'Missing organization ID' };
                }

                await Promise.all([
                    runMutation(internal.system.subscriptions.updateStatus, {
                        organizationId: orgId,
                        status: 'cancelled',
                    }),
                    runMutation(internal.system.subscriptions.updateCancelAt, {
                        organizationId: orgId,
                        cancelAt: undefined,
                    }),
                    clerkClient.organizations.updateOrganization(orgId, {
                        maxAllowedMemberships: 1,
                    }),
                ]);

                console.log("[stripe] subscription.deleted — org cancelled, Clerk seats reset for:", orgId);
            }

            return { 
                success: true,
                error: null,
            };
        } catch (error) {
            console.error('Error verifying webhook', error)
            return {
                success: false,
                error: (error as { message: string }).message,
            };
        }
    }
});

export const billingPortal = action({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const subscription = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
            organizationId: orgId,
        });

        if (!subscription) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Subscription not found",
            });
        }

        if (!subscription.stripeCustomerId) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Customer ID not found",
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const baseUrl = process.env.BASE_URL!;

        const session: Stripe.Response<Stripe.BillingPortal.Session> =
        await stripe.billingPortal.sessions.create({
            locale: "en",
            customer: subscription.stripeCustomerId,
            return_url: `${baseUrl}/billing`,
        });

        return session.url;
    }
})