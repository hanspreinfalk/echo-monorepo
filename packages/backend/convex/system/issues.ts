import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

const issueCategory = v.union(
  v.literal("Bug"),
  v.literal("UX"),
  v.literal("Performance"),
  v.literal("Accessibility"),
  v.literal("Security"),
  v.literal("Data"),
  v.literal("Feature Request"),
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

/** Cap console lines returned in open-issue details (full list may be huge). */
const OPEN_ISSUE_DETAILS_CONSOLE_MAX = 120;

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
    }));
  },
});

/** Full open-issue record for duplicate detection (after listOpenIssues titles/ids). */
export const getOpenIssueDetailsForOrganization = internalQuery({
  args: {
    organizationId: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.organizationId !== args.organizationId) {
      return null;
    }
    if (issue.resolved === true) {
      return null;
    }

    const logs = issue.consoleLogs ?? [];
    const consoleLogs =
      logs.length <= OPEN_ISSUE_DETAILS_CONSOLE_MAX
        ? logs
        : logs.slice(-OPEN_ISSUE_DETAILS_CONSOLE_MAX);

    return {
      issueId: issue._id,
      title: issue.title ?? "",
      description: issue.description ?? "",
      stepsToReproduce: issue.stepsToReproduce,
      category: issue.category,
      criticality: issue.criticality,
      pageUrl: issue.pageUrl,
      consoleLogs,
      consoleLogsTruncated:
        logs.length > OPEN_ISSUE_DETAILS_CONSOLE_MAX
          ? (logs.length - OPEN_ISSUE_DETAILS_CONSOLE_MAX)
          : 0,
      attachments: issue.attachments?.map((a) => ({
        url: a.url,
        filename: a.filename,
        mimeType: a.mimeType,
      })),
      firstReported: issue.firstReported,
      affectedSessionCount: issue.affectedSessions?.length ?? 0,
    };
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
      fixPrompt: undefined,
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

/** Returns stored fix prompt if present (non-empty). */
export const getCachedFixPrompt = internalQuery({
  args: {
    organizationId: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.organizationId !== args.organizationId) {
      return null;
    }
    const text = issue.fixPrompt?.trim();
    return text && text.length > 0 ? text : null;
  },
});

export const setFixPrompt = internalMutation({
  args: {
    organizationId: v.string(),
    issueId: v.id("issues"),
    fixPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.organizationId !== args.organizationId) {
      return;
    }
    await ctx.db.patch(args.issueId, { fixPrompt: args.fixPrompt });
  },
});

/** Full issue + linked sessions for server-side AI fix prompts (authenticated via org id). */
export const getContextForFixPrompt = internalQuery({
  args: {
    organizationId: v.string(),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.organizationId !== args.organizationId) {
      return null;
    }

    const affectedContactSessions = [];
    for (const sessionId of issue.affectedSessions ?? []) {
      const session = await ctx.db.get(sessionId);
      if (session && session.organizationId === args.organizationId) {
        affectedContactSessions.push({
          _id: session._id,
          _creationTime: session._creationTime,
          name: session.name,
          email: session.email,
          expiresAt: session.expiresAt,
          metadata: session.metadata,
        });
      }
    }

    return {
      issue: {
        _id: issue._id,
        _creationTime: issue._creationTime,
        organizationId: issue.organizationId,
        conversationId: issue.conversationId,
        resolved: issue.resolved,
        title: issue.title,
        description: issue.description,
        stepsToReproduce: issue.stepsToReproduce,
        category: issue.category,
        criticality: issue.criticality,
        firstReported: issue.firstReported,
        pageUrl: issue.pageUrl,
        consoleLogs: issue.consoleLogs,
        attachments: issue.attachments,
        affectedSessionIds: issue.affectedSessions,
      },
      affectedContactSessions,
    };
  },
});
