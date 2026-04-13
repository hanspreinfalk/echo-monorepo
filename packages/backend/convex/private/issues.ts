import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import { supportAgent } from "../system/ai/agents/supportAgent";

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

/** In sync: `resolveNotificationPreviewForTitle` in apps/web resolve-issue-dialog.tsx */
function issueResolvedAssistantMessage(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return "Good news — we've marked the issue you reported as resolved on our side. If anything still isn't right, just reply here and we'll take another look.";
  }
  return `Good news — we've marked your report as resolved on our side (${trimmed}). If anything still isn't right, just reply here and we'll take another look.`;
}

export const resolveAndNotifyAffectedChats = mutation({
  args: {
    issueId: v.id("issues"),
    /** Only these linked contact sessions receive the in-chat message (may be empty). */
    notifyContactSessionIds: v.array(v.id("contactSessions")),
    /**
     * Text the assistant sends in chat. Whitespace-only falls back to the default
     * template from the issue title (same as `issueResolvedAssistantMessage`).
     */
    assistantMessage: v.string(),
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

    if (issue.resolved === true) {
      return { notifiedConversationCount: 0, alreadyResolved: true as const };
    }

    const linked = new Set(issue.affectedSessions ?? []);
    for (const sessionId of args.notifyContactSessionIds) {
      if (!linked.has(sessionId)) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Selected visitor is not linked to this issue",
        });
      }
    }

    const title = issue.title ?? "";
    const trimmedAssistant = args.assistantMessage.trim();
    const content =
      trimmedAssistant.length > 0
        ? trimmedAssistant
        : issueResolvedAssistantMessage(title);

    const filingConversation =
      issue.conversationId !== undefined
        ? await ctx.db.get(issue.conversationId)
        : null;

    const threadIdsToNotify = new Set<string>();
    const notifySet = new Set(args.notifyContactSessionIds);

    for (const sessionId of issue.affectedSessions ?? []) {
      if (!notifySet.has(sessionId)) {
        continue;
      }

      const session = await ctx.db.get(sessionId);
      if (!session || session.organizationId !== orgId) {
        continue;
      }

      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_contact_session_id", (q) =>
          q.eq("contactSessionId", sessionId),
        )
        .collect();

      const orgConvs = conversations.filter(
        (c) => c.organizationId === orgId,
      );
      if (orgConvs.length === 0) {
        continue;
      }

      const chosen =
        filingConversation !== null &&
        filingConversation.organizationId === orgId &&
        filingConversation.contactSessionId === sessionId
          ? filingConversation
          : orgConvs.reduce((a, b) =>
              a._creationTime >= b._creationTime ? a : b,
            );

      threadIdsToNotify.add(chosen.threadId);
    }

    let notifiedConversationCount = 0;
    for (const threadId of threadIdsToNotify) {
      await supportAgent.saveMessage(ctx, {
        threadId,
        message: {
          role: "assistant",
          content,
        },
      });
      notifiedConversationCount += 1;
    }

    await ctx.db.patch(args.issueId, { resolved: true });

    return {
      notifiedConversationCount,
      alreadyResolved: false as const,
    };
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

export const recordGithubWorkflowDispatch = mutation({
  args: {
    issueId: v.id("issues"),
    dispatchedAt: v.string(),
    repository: v.string(),
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

    const next = { ...issue };
    next.githubWorkflowDispatchedAt = args.dispatchedAt;
    next.githubWorkflowRepository = args.repository;
    next.githubWorkflowRunStatus = "queued";
    delete next.githubWorkflowRunId;
    delete next.githubWorkflowRunConclusion;

    await ctx.db.replace(args.issueId, next);
  },
});

export const updateGithubWorkflowRun = mutation({
  args: {
    issueId: v.id("issues"),
    runId: v.optional(v.number()),
    runStatus: v.optional(v.string()),
    runConclusion: v.optional(v.union(v.string(), v.null())),
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

    if (!issue.githubWorkflowDispatchedAt) {
      return;
    }

    const patch: Partial<Doc<"issues">> = {};

    if (args.runId !== undefined) {
      patch.githubWorkflowRunId = args.runId;
    }
    if (args.runStatus !== undefined) {
      patch.githubWorkflowRunStatus = args.runStatus;
    }
    if (args.runConclusion !== undefined) {
      patch.githubWorkflowRunConclusion =
        args.runConclusion === null ? "" : args.runConclusion;
    }

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.issueId, patch);
  },
});
