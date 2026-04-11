import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const listByOrganizationId = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("agentCustomTools")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
      .collect();
  },
});

export const getOneForInvocation = internalQuery({
  args: {
    toolId: v.id("agentCustomTools"),
    organizationId: v.string(),
  },
  handler: async (ctx, { toolId, organizationId }) => {
    const row = await ctx.db.get(toolId);
    if (!row || row.organizationId !== organizationId) {
      return null;
    }
    return row;
  },
});
