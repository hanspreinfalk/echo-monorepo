import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

const appearanceArgs = v.optional(
  v.object({
    primaryColor: v.optional(v.string()),
    primaryGradientEndColor: v.optional(v.string()),
    headerForegroundColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    foregroundColor: v.optional(v.string()),
    mutedColor: v.optional(v.string()),
    mutedForegroundColor: v.optional(v.string()),
    borderColor: v.optional(v.string()),
    launcherButtonColor: v.optional(v.string()),
  }),
);

export const upsert = mutation({
  args: {
    greetMessage: v.string(),
    showLogo: v.boolean(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    appearance: appearanceArgs,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
            
    if (identity === null) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Identity not found" });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Organization not found" });
    }

    const existing = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    const fields = {
      greetMessage: args.greetMessage,
      showLogo: args.showLogo,
      defaultSuggestions: args.defaultSuggestions,
      ...(args.appearance !== undefined ? { appearance: args.appearance } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("widgetSettings", { organizationId: orgId, ...fields });
    }
  },
});

/** Upload a logo image to Convex storage and save its URL on widgetSettings. */
export const uploadLogo = action({
  args: {
    bytes: v.bytes(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Identity not found" });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Organization not found" });
    }

    const blob = new Blob([args.bytes], { type: args.mimeType });
    const newStorageId = await ctx.storage.store(blob);
    const logoUrl = await ctx.storage.getUrl(newStorageId);

    await ctx.runMutation(internal.private.widgetSettings.saveLogo, {
      orgId,
      logoUrl: logoUrl ?? "",
      logoStorageId: newStorageId,
    });

    return { logoUrl };
  },
});

/** Internal mutation: persist the new logo URL + storageId and delete any previous storage file. */
export const saveLogo = internalMutation({
  args: {
    orgId: v.string(),
    logoUrl: v.string(),
    logoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.orgId))
      .unique();

    if (existing?.logoStorageId && existing.logoStorageId !== args.logoStorageId) {
      try {
        await ctx.storage.delete(existing.logoStorageId);
      } catch {
        // Old file may already be deleted – ignore.
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        logoUrl: args.logoUrl,
        logoStorageId: args.logoStorageId,
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: args.orgId,
        greetMessage: "Hi! How can I help you today?",
        showLogo: true,
        defaultSuggestions: {},
        logoUrl: args.logoUrl,
        logoStorageId: args.logoStorageId,
      });
    }
  },
});

/** Remove the current logo from storage and clear logoUrl / logoStorageId. */
export const removeLogo = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Identity not found" });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Organization not found" });
    }

    const existing = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (!existing) return;

    if (existing.logoStorageId) {
      try {
        await ctx.storage.delete(existing.logoStorageId as Id<"_storage">);
      } catch {
        // Already deleted – ignore.
      }
    }

    await ctx.db.patch(existing._id, {
      logoUrl: undefined,
      logoStorageId: undefined,
    });
  },
});

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
            
    if (identity === null) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Identity not found" });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Organization not found" });
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    return widgetSettings;
  },
});
