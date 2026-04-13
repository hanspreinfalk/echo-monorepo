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

    const title = issue.title ?? "";
    const content = issueResolvedAssistantMessage(title);

    let notifiedConversationCount = 0;
    const seenThreadIds = new Set<string>();

    for (const sessionId of issue.affectedSessions ?? []) {
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

      for (const conv of conversations) {
        if (conv.organizationId !== orgId) {
          continue;
        }
        if (seenThreadIds.has(conv.threadId)) {
          continue;
        }
        seenThreadIds.add(conv.threadId);
        await supportAgent.saveMessage(ctx, {
          threadId: conv.threadId,
          message: {
            role: "assistant",
            content,
          },
        });
        notifiedConversationCount += 1;
      }
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
