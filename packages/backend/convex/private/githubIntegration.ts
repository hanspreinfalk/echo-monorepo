import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    return await ctx.db
      .query("githubIntegrationSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();
  },
});

export const setSelectedRepo = mutation({
  args: {
    fullName: v.string(),
    githubRepoId: v.number(),
    defaultBranch: v.string(),
    htmlUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const existing = await ctx.db
      .query("githubIntegrationSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    const payload = {
      organizationId: orgId,
      fullName: args.fullName,
      githubRepoId: args.githubRepoId,
      defaultBranch: args.defaultBranch,
      ...(args.htmlUrl !== undefined ? { htmlUrl: args.htmlUrl } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("githubIntegrationSettings", payload);
    }
  },
});
