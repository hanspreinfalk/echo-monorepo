import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

function stripWorkflowPrefsSystemFields(
  row: Doc<"githubIntegrationWorkflowPrefs">,
): Omit<Doc<"githubIntegrationWorkflowPrefs">, "_id" | "_creationTime"> {
  const { _id: _idUnused, _creationTime: _ctUnused, ...rest } = row;
  void _idUnused;
  void _ctUnused;
  return rest;
}

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

export const getWorkflowPrefs = query({
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

    const row = await ctx.db
      .query("githubIntegrationWorkflowPrefs")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    return {
      autoMergePr: row?.autoMergePr ?? false,
      supabaseMcp: row?.supabaseMcp ?? false,
      convexMcp: row?.convexMcp ?? false,
      vercelMcp: row?.vercelMcp ?? false,
      sentryMcp: row?.sentryMcp ?? false,
      manualGithubWorkflowDispatchedAt: row?.manualGithubWorkflowDispatchedAt,
      manualGithubWorkflowRepository: row?.manualGithubWorkflowRepository,
      manualGithubWorkflowRunId: row?.manualGithubWorkflowRunId,
      manualGithubWorkflowRunStatus: row?.manualGithubWorkflowRunStatus,
      manualGithubWorkflowRunConclusion: row?.manualGithubWorkflowRunConclusion,
    };
  },
});

export const setWorkflowPrefs = mutation({
  args: {
    autoMergePr: v.boolean(),
    supabaseMcp: v.boolean(),
    convexMcp: v.boolean(),
    vercelMcp: v.boolean(),
    sentryMcp: v.boolean(),
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
      .query("githubIntegrationWorkflowPrefs")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    const payload = {
      organizationId: orgId,
      autoMergePr: args.autoMergePr,
      supabaseMcp: args.supabaseMcp,
      convexMcp: args.convexMcp,
      vercelMcp: args.vercelMcp,
      sentryMcp: args.sentryMcp,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        autoMergePr: args.autoMergePr,
        supabaseMcp: args.supabaseMcp,
        convexMcp: args.convexMcp,
        vercelMcp: args.vercelMcp,
        sentryMcp: args.sentryMcp,
      });
    } else {
      await ctx.db.insert("githubIntegrationWorkflowPrefs", payload);
    }
  },
});

export const recordManualGithubWorkflowDispatch = mutation({
  args: {
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

    const existing = await ctx.db
      .query("githubIntegrationWorkflowPrefs")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (!existing) {
      await ctx.db.insert("githubIntegrationWorkflowPrefs", {
        organizationId: orgId,
        autoMergePr: false,
        supabaseMcp: false,
        convexMcp: false,
        vercelMcp: false,
        sentryMcp: false,
        manualGithubWorkflowDispatchedAt: args.dispatchedAt,
        manualGithubWorkflowRepository: args.repository,
        manualGithubWorkflowRunStatus: "queued",
      });
      return;
    }

    const next = stripWorkflowPrefsSystemFields(existing);
    next.manualGithubWorkflowDispatchedAt = args.dispatchedAt;
    next.manualGithubWorkflowRepository = args.repository;
    next.manualGithubWorkflowRunStatus = "queued";
    delete next.manualGithubWorkflowRunId;
    delete next.manualGithubWorkflowRunConclusion;

    await ctx.db.replace(existing._id, next);
  },
});

export const updateManualGithubWorkflowRun = mutation({
  args: {
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

    const row = await ctx.db
      .query("githubIntegrationWorkflowPrefs")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (!row?.manualGithubWorkflowDispatchedAt) {
      return;
    }

    const patch: Partial<Doc<"githubIntegrationWorkflowPrefs">> = {};

    if (args.runId !== undefined) {
      patch.manualGithubWorkflowRunId = args.runId;
    }
    if (args.runStatus !== undefined) {
      patch.manualGithubWorkflowRunStatus = args.runStatus;
    }
    if (args.runConclusion !== undefined) {
      patch.manualGithubWorkflowRunConclusion =
        args.runConclusion === null ? "" : args.runConclusion;
    }

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(row._id, patch);
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
