import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { SESSION_DURATION_MS } from "../constants";

const contactSessionMetadata = v.object({
  userAgent: v.optional(v.string()),
  language: v.optional(v.string()),
  languages: v.optional(v.string()),
  platform: v.optional(v.string()),
  vendor: v.optional(v.string()),
  screenResolution: v.optional(v.string()),
  viewportSize: v.optional(v.string()),
  timezone: v.optional(v.string()),
  timezoneOffset: v.optional(v.number()),
  cookieEnabled: v.optional(v.boolean()),
  referrer: v.optional(v.string()),
  currentUrl: v.optional(v.string()),
  hostPageUrl: v.optional(v.string()),
  hostConsoleLogs: v.optional(v.array(v.string())),
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    metadata: v.optional(contactSessionMetadata),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION_MS;

    const contactSessionId = await ctx.db.insert("contactSessions", {
      name: args.name,
      email: args.email,
      organizationId: args.organizationId,
      expiresAt,
      metadata: args.metadata,
    });

    return contactSessionId;
  },
});

/**
 * Identity assertion from the host page (`Bryan.setUser(...)` in the embed).
 *
 * Looks up the most recent non-expired session for this email + org and
 * returns it (refreshed name/avatar/expiresAt). If none exists, inserts a new
 * one. Email is normalized (trim + lowercase) so casing differences don't
 * fragment sessions.
 *
 * NOTE: identity is *unverified* — anyone with the embed loaded can call
 * `setUser` from devtools. Treat this as the same trust level as a manual
 * login form fill. If real auth is needed later, add a signed `identityHash`.
 */
export const findOrCreateByIdentity = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    pictureUrl: v.optional(v.string()),
    metadata: v.optional(contactSessionMetadata),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION_MS;
    const normalizedEmail = args.email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Email is required",
      });
    }

    const existing = await ctx.db
      .query("contactSessions")
      .withIndex("by_organization_and_email", (q) =>
        q.eq("organizationId", args.organizationId).eq("email", normalizedEmail),
      )
      .order("desc")
      .first();

    if (existing && existing.expiresAt > now) {
      const prevMetadata = existing.metadata ?? {};
      await ctx.db.patch(existing._id, {
        name: args.name,
        expiresAt,
        ...(args.pictureUrl !== undefined ? { pictureUrl: args.pictureUrl } : {}),
        ...(args.metadata !== undefined
          ? { metadata: { ...prevMetadata, ...args.metadata } }
          : {}),
      });
      return existing._id;
    }

    const contactSessionId = await ctx.db.insert("contactSessions", {
      name: args.name,
      email: normalizedEmail,
      organizationId: args.organizationId,
      expiresAt,
      ...(args.pictureUrl !== undefined ? { pictureUrl: args.pictureUrl } : {}),
      metadata: args.metadata,
    });

    return contactSessionId;
  },
});

export const patchHostContext = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
    hostPageUrl: v.optional(v.string()),
    hostConsoleLogs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);

    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const prev = session.metadata ?? {};
    /** Embed sends the full ring buffer each flush—replace, do not append (append duplicated every line). */
    const nextLogs =
      args.hostConsoleLogs !== undefined
        ? args.hostConsoleLogs.slice(-300)
        : prev.hostConsoleLogs;

    await ctx.db.patch(args.contactSessionId, {
      metadata: {
        ...prev,
        ...(args.hostPageUrl !== undefined ? { hostPageUrl: args.hostPageUrl } : {}),
        ...(nextLogs !== undefined ? { hostConsoleLogs: nextLogs } : {}),
      },
    });
  },
});

export const validate = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      return { valid: false, reason: "Contact session not found" };
    }

    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, reason: "Contact session expired" };
    }

    return { valid: true, contactSession };
  },
});