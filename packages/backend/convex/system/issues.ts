import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

const issueCategory = v.union(
  v.literal("Bug"),
  v.literal("UX"),
  v.literal("Performance"),
  v.literal("Accessibility"),
  v.literal("Security"),
  v.literal("Data"),
);

const issueCriticality = v.union(
  v.literal("Critical"),
  v.literal("High"),
  v.literal("Medium"),
  v.literal("Low"),
);

const issueAttachment = v.object({
  url: v.string(),
  filename: v.optional(v.string()),
  mimeType: v.optional(v.string()),
  storageId: v.optional(v.id("_storage")),
});

const DESCRIPTION_PREVIEW_MAX = 1200;

export const listUnresolvedForOrganization = internalQuery({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const max = Math.min(Math.max(args.limit ?? 25, 1), 50);
    const candidates = await ctx.db
      .query("issues")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .take(120);

    const unresolved = candidates.filter((i) => i.resolved !== true).slice(0, max);

    return unresolved.map((i) => ({
      issueId: i._id,
      title: i.title ?? "",
      descriptionPreview: (i.description ?? "").slice(0, DESCRIPTION_PREVIEW_MAX),
      stepsToReproducePreview: (i.stepsToReproduce ?? "").slice(0, 600),
      pageUrl: i.pageUrl,
      consoleLogsPreview: i.consoleLogs?.slice(0, 20),
      category: i.category,
      criticality: i.criticality,
      firstReported: i.firstReported,
      affectedSessionCount: i.affectedSessions?.length ?? 0,
    }));
  },
});

export const appendAffectedSession = internalMutation({
  args: {
    issueId: v.id("issues"),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.organizationId !== args.organizationId) {
      return { ok: false as const, error: "Issue not found" };
    }
    if (issue.resolved === true) {
      return { ok: false as const, error: "Issue is already resolved" };
    }

    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.organizationId !== args.organizationId) {
      return { ok: false as const, error: "Invalid contact session" };
    }

    const existing = issue.affectedSessions ?? [];
    if (existing.includes(args.contactSessionId)) {
      return { ok: true as const, alreadyLinked: true };
    }

    await ctx.db.patch(args.issueId, {
      affectedSessions: [...existing, args.contactSessionId],
    });
    return { ok: true as const, alreadyLinked: false };
  },
});

export const create = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.optional(v.id("conversations")),
    title: v.string(),
    description: v.string(),
    stepsToReproduce: v.optional(v.string()),
    category: issueCategory,
    criticality: issueCriticality,
    pageUrl: v.optional(v.string()),
    consoleLogs: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(issueAttachment)),
    affectedSessions: v.optional(v.array(v.id("contactSessions"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("issues", {
      organizationId: args.organizationId,
      conversationId: args.conversationId,
      resolved: false,
      title: args.title,
      description: args.description,
      stepsToReproduce: args.stepsToReproduce,
      category: args.category,
      criticality: args.criticality,
      pageUrl: args.pageUrl,
      consoleLogs: args.consoleLogs,
      attachments: args.attachments,
      affectedSessions: args.affectedSessions,
      firstReported: now,
    });
  },
});
