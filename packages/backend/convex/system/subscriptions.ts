import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { ConvexError } from "convex/values";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    plan: v.union(
      v.literal('free'),
      v.literal('pro')
    ),
    status: v.union(
      v.literal('active'),
      v.literal('cancelled'),
      v.literal('expired'),
      v.literal('past_due'),
      v.literal('unpaid')
    ),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => 
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    if (existingSubscription) {
      await ctx.db.replace(existingSubscription._id, {
        organizationId: args.organizationId,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        startDate: args.startDate,
        endDate: args.endDate,
        plan: args.plan,
        status: args.status,
        // explicitly omitted: cancelledAt, cancelAt — cleared on every upsert
      });
      return existingSubscription._id;
    }

    return await ctx.db.insert("subscriptions", {
      organizationId: args.organizationId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      startDate: args.startDate,
      endDate: args.endDate,
      plan: args.plan,
      status: args.status,
    });
  },
});

export const updateStatus = internalMutation({
  args: {
    organizationId: v.string(),
    status: v.union(
      v.literal('active'),
      v.literal('cancelled'),
      v.literal('expired'),
      v.literal('past_due'),
      v.literal('unpaid')
    ),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

      if (!subscription) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      await ctx.db.patch(subscription._id, {
        status: args.status,
        cancelledAt: args.status === 'cancelled' ? Date.now() : undefined,
      });
  },
})

export const updateEndDate = internalMutation({
  args: {
    organizationId: v.string(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

      if (!subscription) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      await ctx.db.patch(subscription._id, {
        endDate: args.endDate,
      });
  },
})

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => 
        q.eq("organizationId", args.organizationId),
      )
      .unique();
  },
});

export const getByStatus = internalQuery({
  args: {
    status: v.union(
      v.literal('active'),
      v.literal('cancelled'),
      v.literal('expired'),
      v.literal('past_due'),
      v.literal('unpaid')
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  }
})

export const getByPlan = internalQuery({
  args: {
    plan: v.union(
      v.literal('free'),
      v.literal('pro')
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_plan", (q) => q.eq("plan", args.plan))
      .collect();
  }
})

export const updateCancelAt = internalMutation({
  args: {
    organizationId: v.string(),
    cancelAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    if (!subscription) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      });
    }

    if (args.cancelAt !== undefined) {
      await ctx.db.patch(subscription._id, { cancelAt: args.cancelAt });
    } else {
      // patch({ cancelAt: undefined }) is a no-op in Convex — undefined values are stripped
      // before serialization. Use replace to physically remove the field from the document.
      const { _id, _creationTime, cancelAt: _removed, ...rest } = subscription;
      await ctx.db.replace(_id, rest);
    }
  },
});

export const getByStripeSubscriptionId = internalQuery({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription_id", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .unique();
  }
})