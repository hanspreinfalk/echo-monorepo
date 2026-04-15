import { query } from "../_generated/server";

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const orgId = identity.orgId as string | undefined;
    if (!orgId) {
      return null;
    }

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", orgId),
      )
      .unique();
  },
});
