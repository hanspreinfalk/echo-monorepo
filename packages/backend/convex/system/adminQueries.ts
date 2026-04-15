import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/** Find a single user row by Clerk user ID. */
export const findUserByClerkId = internalQuery({
    args: { clerkUserId: v.string() },
    handler: async (ctx, args): Promise<Doc<"users"> | null> => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
            .unique();
    },
});

/** Find a single user row by exact email (case-sensitive). */
export const findUserByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args): Promise<Doc<"users"> | null> => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

/** Search users by name using the search index (up to 10 results). */
export const searchUsersByName = internalQuery({
    args: { query: v.string() },
    handler: async (ctx, args): Promise<Doc<"users">[]> => {
        return await ctx.db
            .query("users")
            .withSearchIndex("search_by_name", (sq) => sq.search("name", args.query))
            .take(10);
    },
});

/** Fetch the subscription row for each of the given organization IDs. */
export const getSubscriptionsByOrgIds = internalQuery({
    args: { organizationIds: v.array(v.string()) },
    handler: async (ctx, args): Promise<Doc<"subscriptions">[]> => {
        const unique = [...new Set(args.organizationIds)].slice(0, 50);
        const results: Doc<"subscriptions">[] = [];
        for (const organizationId of unique) {
            const sub = await ctx.db
                .query("subscriptions")
                .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
                .unique();
            if (sub) results.push(sub);
        }
        return results;
    },
});

/** Fetch all transaction rows for each of the given organization IDs. */
export const getTransactionsByOrgIds = internalQuery({
    args: { organizationIds: v.array(v.string()) },
    handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
        const unique = [...new Set(args.organizationIds)].slice(0, 50);
        const results: Doc<"transactions">[] = [];
        for (const organizationId of unique) {
            const txs = await ctx.db
                .query("transactions")
                .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
                .collect();
            results.push(...txs);
        }
        return results;
    },
});

/** Batch-fetch subscription rows by organization ids. */
export const batchSubsByOrgIds = internalQuery({
    args: { organizationIds: v.array(v.string()) },
    handler: async (ctx, args): Promise<Record<string, Doc<"subscriptions"> | null>> => {
        const unique = [...new Set(args.organizationIds)].slice(0, 50);
        const out: Record<string, Doc<"subscriptions"> | null> = {};
        for (const organizationId of unique) {
            const sub = await ctx.db
                .query("subscriptions")
                .withIndex("by_organization_id", (q) =>
                    q.eq("organizationId", organizationId),
                )
                .unique();
            out[organizationId] = sub ?? null;
        }
        return out;
    },
});
