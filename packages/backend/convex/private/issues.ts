import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "../_generated/dataModel";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
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

    const result = await ctx.db
      .query("issues")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .order("desc")
      .paginate(args.paginationOpts);

    const page: Array<
      Doc<"issues"> & { resolvedContactSessions: Doc<"contactSessions">[] }
    > = await Promise.all(
      result.page.map(async (issue) => {
        const resolved: Doc<"contactSessions">[] = [];
        for (const sessionId of issue.affectedSessions ?? []) {
          const session = await ctx.db.get(sessionId);
          if (session && session.organizationId === orgId) {
            resolved.push(session);
          }
        }
        return { ...issue, resolvedContactSessions: resolved };
      }),
    );

    return { ...result, page };
  },
});

export const setResolved = mutation({
  args: {
    issueId: v.id("issues"),
    resolved: v.boolean(),
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

    const issue = await ctx.db.get(args.issueId);

    if (!issue) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Issue not found",
      });
    }

    if (issue.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization",
      });
    }

    await ctx.db.patch(args.issueId, { resolved: args.resolved });
  },
});

export const remove = mutation({
  args: {
    issueId: v.id("issues"),
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

    const issue = await ctx.db.get(args.issueId);

    if (!issue) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Issue not found",
      });
    }

    if (issue.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization",
      });
    }

    await ctx.db.delete(args.issueId);
  },
});
