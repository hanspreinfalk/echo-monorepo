import { createClerkClient } from "@clerk/backend";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { action, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireAdmin } from "../lib/assertAdmin";
import { statsIncrUsers } from "../system/adminStats";
import Stripe from "stripe";
import { PRO_PRICE_CENTS } from "../pricing";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
});

const subscriptionStatusValue = v.union(
    v.literal("active"),
    v.literal("cancelled"),
    v.literal("expired"),
    v.literal("past_due"),
    v.literal("unpaid"),
);

const transactionStatusValue = v.union(
    v.literal("pending"),
    v.literal("succeeded"),
    v.literal("failed"),
);

async function loadOrganizationSummaries(
    ctx: QueryCtx,
): Promise<
    Array<{
        organizationId: string;
        subscription: Doc<"subscriptions"> | null;
    }>
> {
    const subs = await ctx.db.query("subscriptions").collect();
    const widgets = await ctx.db.query("widgetSettings").collect();

    const byOrg = new Map<
        string,
        { organizationId: string; subscription: Doc<"subscriptions"> | null }
    >();

    for (const s of subs) {
        byOrg.set(s.organizationId, {
            organizationId: s.organizationId,
            subscription: s,
        });
    }
    for (const w of widgets) {
        if (byOrg.has(w.organizationId)) {
            continue;
        }
        byOrg.set(w.organizationId, {
            organizationId: w.organizationId,
            subscription: null,
        });
    }

    return [...byOrg.values()].sort((a, b) =>
        a.organizationId.localeCompare(b.organizationId),
    );
}

/** Paginated `users` rows (newest first). */
export const listUsers = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db
            .query("users")
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

/** Paginated subscriptions; optional `status` uses the `by_status` index. */
export const listSubscriptions = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(subscriptionStatusValue),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const status = args.status;
        if (status !== undefined) {
            return await ctx.db
                .query("subscriptions")
                .withIndex("by_status", (q) => q.eq("status", status))
                .order("desc")
                .paginate(args.paginationOpts);
        }
        return await ctx.db
            .query("subscriptions")
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

/** Paginated transactions; optional `status` uses the `by_status` index. */
export const listTransactions = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(transactionStatusValue),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const status = args.status;
        if (status !== undefined) {
            return await ctx.db
                .query("transactions")
                .withIndex("by_status", (q) => q.eq("status", status))
                .order("desc")
                .paginate(args.paginationOpts);
        }
        return await ctx.db
            .query("transactions")
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

/**
 * List ALL organizations from Clerk (source of truth), paginated by offset.
 * Each org is enriched with its Convex subscription row if one exists.
 * Replaces the old Convex-table-only `listOrganizations` query.
 */
export const listOrganizationsFromClerk = action({
    args: {
        offset: v.number(),
        limit: v.number(),
    },
    handler: async (ctx, args): Promise<{
        organizations: Array<{
            organizationId: string;
            name: string | null;
            subscription: Doc<"subscriptions"> | null;
        }>;
        hasMore: boolean;
    }> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const limit = Math.min(Math.max(1, args.limit), 100);
        const offset = Math.max(0, args.offset);

        const clerkResult = await clerkClient.organizations.getOrganizationList({
            limit: limit + 1, // fetch one extra to detect hasMore
            offset,
        });

        const page = (clerkResult.data ?? []).slice(0, limit);
        const hasMore = (clerkResult.data ?? []).length > limit;

        const orgIds = page.map((o) => o.id);
        const subMap = orgIds.length
            ? await ctx.runQuery(internal.system.adminQueries.batchSubsByOrgIds, {
                  organizationIds: orgIds,
              })
            : {};

        return {
            organizations: page.map((o) => ({
                organizationId: o.id,
                name: o.name ?? null,
                subscription: subMap[o.id] ?? null,
            })),
            hasMore,
        };
    },
});

const ZERO_STATS = {
    totalUsers: 0,
    totalOrganizations: 0,
    totalSubscriptions: 0,
    subscriptionsByStatus: {
        active: 0,
        cancelled: 0,
        expired: 0,
        past_due: 0,
        unpaid: 0,
    },
    totalTransactions: 0,
    transactionsByStatus: { pending: 0, succeeded: 0, failed: 0 },
    totalRevenueSmallestUnit: 0,
} as const;

/**
 * O(1) admin stats — reads a single pre-aggregated singleton document.
 * Counters are maintained by every write path; call `rebuildStats` to fix drift.
 */
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const doc = await ctx.db
            .query("adminStats")
            .withIndex("by_tag", (q) => q.eq("tag", "singleton"))
            .unique();
        return doc ?? ZERO_STATS;
    },
});

/**
 * Recomputes all stats counters from scratch.
 * Safe to run at any time; use to fix any counter drift.
 */
export const rebuildStats = action({
    args: {},
    handler: async (ctx) => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});
        await ctx.runMutation(internal.system.adminStats.rebuild, {});
    },
});

/**
 * Full-text search across users by name OR email.
 * Merges results from both search indexes and deduplicates.
 * Returns at most 25 results — not paginated (search mode replaces pagination).
 */
export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const q = args.query.trim();
        if (!q) return [];

        const [byName, byEmail] = await Promise.all([
            ctx.db
                .query("users")
                .withSearchIndex("search_by_name", (sq) => sq.search("name", q))
                .take(25),
            ctx.db
                .query("users")
                .withSearchIndex("search_by_email", (sq) => sq.search("email", q))
                .take(25),
        ]);

        const seen = new Set<string>();
        const results: typeof byName = [];
        for (const u of [...byName, ...byEmail]) {
            if (!seen.has(u._id)) {
                seen.add(u._id);
                results.push(u);
            }
        }
        return results.slice(0, 25);
    },
});

/**
 * Given a user email, return their Clerk organisation memberships together
 * with the matching Convex subscription row (if any).
 */
export const listOrganizationsForUserEmail = action({
    args: { email: v.string() },
    handler: async (ctx, args): Promise<{
        user: { _id: string; name: string; email?: string; clerkUserId?: string } | null;
        organizations: Array<{
            organizationId: string;
            name: string;
            subscription: { status?: string; plan?: string; stripeSubscriptionId?: string } | null;
        }>;
    }> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const email = args.email.trim().toLowerCase();
        if (!email) return { user: null, organizations: [] };

        const user = await ctx.runQuery(internal.system.adminQueries.findUserByEmail, { email });

        if (!user?.clerkUserId) {
            return { user: user ?? null, organizations: [] };
        }

        const res = await clerkClient.users.getOrganizationMembershipList({
            userId: user.clerkUserId,
            limit: 50,
        });
        const memberships = res.data ?? [];
        const orgs = memberships.map((m) => ({
            organizationId: m.organization.id,
            name: m.organization.name ?? m.organization.id,
        }));

        if (orgs.length === 0) {
            return { user, organizations: [] };
        }

        const orgIds = orgs.map((o) => o.organizationId);
        const subMap = await ctx.runQuery(internal.system.adminQueries.batchSubsByOrgIds, {
            organizationIds: orgIds,
        });

        const organizations = orgs.map((org) => ({
            ...org,
            subscription: subMap[org.organizationId] ?? null,
        }));

        return { user, organizations };
    },
});

/**
 * Search subscriptions by user email, user name, or organization name/id.
 *
 * Resolution:
 *  1. `org_…`      → direct org ID lookup
 *  2. contains `@` → email → Convex user → Clerk org memberships
 *  3. anything else → top-5 name-matched users' orgs + Clerk org name search
 */
export const searchSubscriptions = action({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<Doc<"subscriptions">[]> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const q = args.query.trim();
        if (!q) return [];

        const orgIdSet = new Set<string>();

        if (q.startsWith("org_")) {
            orgIdSet.add(q);
        } else if (q.includes("@")) {
            const user = await ctx.runQuery(internal.system.adminQueries.findUserByEmail, {
                email: q.toLowerCase(),
            });
            if (user?.clerkUserId) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: user.clerkUserId,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
        } else {
            const users = await ctx.runQuery(internal.system.adminQueries.searchUsersByName, {
                query: q,
            });
            for (const u of users.filter((x) => x.clerkUserId).slice(0, 5)) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: u.clerkUserId!,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
            try {
                const clerkOrgs = await clerkClient.organizations.getOrganizationList({
                    query: q,
                    limit: 10,
                });
                for (const o of clerkOrgs.data ?? []) orgIdSet.add(o.id);
            } catch { /* Clerk org search is non-fatal */ }
        }

        if (orgIdSet.size === 0) return [];
        return await ctx.runQuery(internal.system.adminQueries.getSubscriptionsByOrgIds, {
            organizationIds: [...orgIdSet],
        });
    },
});

/**
 * Search transactions by user email, user name, or organization name/id.
 * Uses the same resolution logic as `searchSubscriptions`.
 */
export const searchTransactions = action({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const q = args.query.trim();
        if (!q) return [];

        const orgIdSet = new Set<string>();

        if (q.startsWith("org_")) {
            orgIdSet.add(q);
        } else if (q.includes("@")) {
            const user = await ctx.runQuery(internal.system.adminQueries.findUserByEmail, {
                email: q.toLowerCase(),
            });
            if (user?.clerkUserId) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: user.clerkUserId,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
        } else {
            const users = await ctx.runQuery(internal.system.adminQueries.searchUsersByName, {
                query: q,
            });
            for (const u of users.filter((x) => x.clerkUserId).slice(0, 5)) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: u.clerkUserId!,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
            try {
                const clerkOrgs = await clerkClient.organizations.getOrganizationList({
                    query: q,
                    limit: 10,
                });
                for (const o of clerkOrgs.data ?? []) orgIdSet.add(o.id);
            } catch { /* Clerk org search is non-fatal */ }
        }

        if (orgIdSet.size === 0) return [];
        return await ctx.runQuery(internal.system.adminQueries.getTransactionsByOrgIds, {
            organizationIds: [...orgIdSet],
        });
    },
});


/**
 * Search organizations by user email, user name, organization name, or org id.
 * Returns org summaries (same shape as `listOrganizations`) filtered to matching orgs.
 *
 * Resolution:
 *  1. `org_…`      → direct org ID
 *  2. contains `@` → email → Convex user → Clerk org memberships
 *  3. anything else → top-5 name-matched users' orgs + Clerk org name search
 */
export const searchOrganizations = action({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<Array<{
        organizationId: string;
        name: string | null;
        subscription: Doc<"subscriptions"> | null;
    }>> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const q = args.query.trim();
        if (!q) return [];

        const orgIdSet = new Set<string>();

        if (q.startsWith("org_")) {
            orgIdSet.add(q);
        } else if (q.includes("@")) {
            const user = await ctx.runQuery(internal.system.adminQueries.findUserByEmail, {
                email: q.toLowerCase(),
            });
            if (user?.clerkUserId) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: user.clerkUserId,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
        } else {
            const users = await ctx.runQuery(internal.system.adminQueries.searchUsersByName, {
                query: q,
            });
            for (const u of users.filter((x) => x.clerkUserId).slice(0, 5)) {
                const res = await clerkClient.users.getOrganizationMembershipList({
                    userId: u.clerkUserId!,
                    limit: 50,
                });
                for (const m of res.data ?? []) orgIdSet.add(m.organization.id);
            }
            try {
                const clerkOrgs = await clerkClient.organizations.getOrganizationList({
                    query: q,
                    limit: 10,
                });
                for (const o of clerkOrgs.data ?? []) orgIdSet.add(o.id);
            } catch { /* Clerk org search is non-fatal */ }
        }

        if (orgIdSet.size === 0) return [];

        // Fetch subscriptions and Clerk org names in parallel
        const orgIds = [...orgIdSet];
        const subMap = await ctx.runQuery(internal.system.adminQueries.batchSubsByOrgIds, {
            organizationIds: orgIds,
        });

        const nameEntries = await Promise.allSettled(
            orgIds.map(async (id) => {
                try {
                    const org = await clerkClient.organizations.getOrganization({ organizationId: id });
                    return [id, org.name ?? null] as const;
                } catch {
                    return [id, null] as const;
                }
            }),
        );
        const nameMap: Record<string, string | null> = {};
        for (const r of nameEntries) {
            if (r.status === "fulfilled") nameMap[r.value[0]] = r.value[1];
        }

        return orgIds.map((id) => ({
            organizationId: id,
            name: nameMap[id] ?? null,
            subscription: subMap[id] ?? null,
        }));
    },
});

/** Lookup Convex subscription rows for Clerk org ids (user action menus). */
export const batchSubscriptionsByOrganizationIds = query({
    args: {
        organizationIds: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const unique = [...new Set(args.organizationIds)].slice(0, 40);
        const out: Record<string, Doc<"subscriptions"> | null> = {};
        for (const organizationId of unique) {
            const sub = await ctx.db
                .query("subscriptions")
                .withIndex("by_organization_id", (q) =>
                    q.eq("organizationId", organizationId),
                )
                .unique();
            out[organizationId] = sub ?? null;
        }
        return out;
    },
});

export const setUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("user")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const target = await ctx.db.get(args.userId);
        if (!target) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }
        await ctx.db.patch(args.userId, { role: args.role });
    },
});

/** Create or update a Convex user row by Clerk user id (e.g. before first dashboard visit). */
export const upsertUserByClerkId = mutation({
    args: {
        clerkUserId: v.string(),
        role: v.union(v.literal("admin"), v.literal("user")),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
            .unique();

        const displayName = args.name?.trim() || "User (pending sign-in)";

        if (existing) {
            await ctx.db.patch(existing._id, {
                role: args.role,
                name: args.name !== undefined ? displayName : existing.name,
            });
            return existing._id;
        }

        const id = await ctx.db.insert("users", {
            name: displayName,
            clerkUserId: args.clerkUserId,
            role: args.role,
        });
        await statsIncrUsers(ctx);
        return id;
    },
});

export const fetchOrganizationNames = action({
    args: {
        organizationIds: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const unique = [...new Set(args.organizationIds)].slice(0, 50);
        const entries: { organizationId: string; name: string | null }[] = [];

        for (const organizationId of unique) {
            try {
                const org = await clerkClient.organizations.getOrganization({
                    organizationId,
                });
                entries.push({
                    organizationId,
                    name: org.name ?? null,
                });
            } catch {
                entries.push({ organizationId, name: null });
            }
        }

        return Object.fromEntries(
            entries.map((e) => [e.organizationId, e.name] as const),
        ) as Record<string, string | null>;
    },
});

/**
 * For each org ID, fetch the first admin/owner member from Clerk and look
 * up their Convex `users` row. Returns a map of orgId → { name, email }.
 * At most 40 orgs per call; 1 member shown per org.
 */
export const fetchOrgPrimaryUsers = action({
    args: { organizationIds: v.array(v.string()) },
    handler: async (ctx, args): Promise<Record<string, { name: string; email: string | null } | null>> => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const unique = [...new Set(args.organizationIds)].slice(0, 40);
        const out: Record<string, { name: string; email: string | null } | null> = {};

        await Promise.all(
            unique.map(async (organizationId) => {
                try {
                    const members = await clerkClient.organizations.getOrganizationMembershipList({
                        organizationId,
                        limit: 5,
                    });
                    // Prefer admins/owners, fall back to first member
                    const sorted = (members.data ?? []).sort((a, b) => {
                        const rank = (r: string) =>
                            r === "org:admin" ? 0 : r === "org:member" ? 1 : 2;
                        return rank(a.role) - rank(b.role);
                    });
                    const first = sorted[0];
                    if (!first?.publicUserData?.userId) {
                        out[organizationId] = null;
                        return;
                    }
                    const clerkUserId = first.publicUserData.userId;
                    const convexUser = await ctx.runQuery(
                        internal.system.adminQueries.findUserByClerkId,
                        { clerkUserId },
                    );
                    if (convexUser) {
                        out[organizationId] = { name: convexUser.name, email: convexUser.email ?? null };
                    } else {
                        // Fall back to Clerk data if not in Convex yet
                        const firstName = first.publicUserData.firstName ?? "";
                        const lastName = first.publicUserData.lastName ?? "";
                        const displayName = [firstName, lastName].filter(Boolean).join(" ") || clerkUserId;
                        const identifier = first.publicUserData.identifier ?? null;
                        out[organizationId] = { name: displayName, email: identifier };
                    }
                } catch {
                    out[organizationId] = null;
                }
            }),
        );

        return out;
    },
});

/** Clerk organizations this user is a member of (for admin subscription actions). */
export const listClerkOrganizationsForUser = action({
    args: {
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const res = await clerkClient.users.getOrganizationMembershipList({
            userId: args.clerkUserId,
            limit: 50,
        });

        const rows = res.data ?? [];
        return rows.map((m) => ({
            organizationId: m.organization.id,
            name: m.organization.name ?? m.organization.id,
        }));
    },
});

/** Stripe Checkout to upgrade an organization to Pro (same flow as customer checkout). */
export const startProCheckoutForOrganization = action({
    args: {
        organizationId: v.string(),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            { organizationId: args.organizationId },
        );

        if (subscription && subscription.status === "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "This organization already has an active subscription.",
            });
        }

        const clerkUser = await clerkClient.users.getUser(args.clerkUserId);
        const primaryId = clerkUser.primaryEmailAddressId;
        const email =
            clerkUser.emailAddresses.find((e) => e.id === primaryId)
                ?.emailAddress ??
            clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Clerk user has no email; cannot pre-fill Stripe checkout.",
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const baseUrl = process.env.BASE_URL!;
        const amountCents = PRO_PRICE_CENTS;
        const orgId = args.organizationId;

        const customerParam: Pick<
            Stripe.Checkout.SessionCreateParams,
            "customer" | "customer_email"
        > = subscription?.stripeCustomerId
            ? { customer: subscription.stripeCustomerId }
            : { customer_email: email };

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            locale: "en",
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Pro Subscription",
                            description: "Access to all features",
                        },
                        unit_amount: amountCents,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            ...customerParam,
            metadata: {
                orgId,
                plan: "pro",
                currency: "usd",
                amount: String(amountCents),
            },
            subscription_data: {
                metadata: {
                    orgId,
                    plan: "pro",
                    currency: "usd",
                    amount: String(amountCents),
                },
            },
            success_url: `${baseUrl}/billing?success=true`,
            cancel_url: `${baseUrl}/billing?cancel=true`,
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);
        return session.url;
    },
});

/** Sets Stripe cancel_at_period_end so Pro ends after the current period (webhook syncs Convex). */
export const scheduleSubscriptionCancelAtPeriodEnd = action({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runQuery(internal.system.adminAuth.verify, {});

        const subRecord = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            { organizationId: args.organizationId },
        );

        if (!subRecord?.stripeSubscriptionId) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "No Stripe subscription for this organization.",
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const stripeSub = await stripe.subscriptions.retrieve(
            subRecord.stripeSubscriptionId,
        );

        const ok = ["active", "trialing", "past_due"].includes(stripeSub.status);
        if (!ok) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: `Stripe subscription is ${stripeSub.status}; nothing to downgrade.`,
            });
        }

        await stripe.subscriptions.update(subRecord.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        return { ok: true as const };
    },
});
