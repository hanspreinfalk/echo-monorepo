/**
 * Scalable admin stats via the counter-document pattern.
 *
 * A single "singleton" row in `adminStats` stores pre-aggregated counters.
 * Every write path (users / subscriptions / transactions) calls the exported
 * helper functions below so counters stay in sync.  `getStats` becomes a
 * single O(1) document read instead of a full-table scan.
 *
 * To recover from any counter drift, call `admin.rebuildStats` (action) which
 * runs the `rebuild` internalMutation here to recompute everything from scratch.
 */

import { internalMutation, internalQuery } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";

type SubStatus = "active" | "cancelled" | "expired" | "past_due" | "unpaid";
type TxStatus = "pending" | "succeeded" | "failed";

const ZERO = {
    tag: "singleton" as const,
    totalUsers: 0,
    totalOrganizations: 0,
    totalSubscriptions: 0,
    subscriptionsByStatus: {
        active: 0,
        cancelled: 0,
        expired: 0,
        past_due: 0,
        unpaid: 0,
    },
    totalTransactions: 0,
    transactionsByStatus: { pending: 0, succeeded: 0, failed: 0 },
    totalRevenueSmallestUnit: 0,
};

async function getSingleton(ctx: MutationCtx) {
    const existing = await ctx.db
        .query("adminStats")
        .withIndex("by_tag", (q) => q.eq("tag", "singleton"))
        .unique();
    if (existing) return existing;
    const id = await ctx.db.insert("adminStats", ZERO);
    return (await ctx.db.get(id))!;
}

// ---------------------------------------------------------------------------
// Exported helper functions — call these from within mutations.
// They share the caller's Convex transaction (no nested mutation overhead).
// ---------------------------------------------------------------------------

export async function statsIncrUsers(ctx: MutationCtx) {
    const doc = await getSingleton(ctx);
    await ctx.db.patch(doc._id, { totalUsers: doc.totalUsers + 1 });
}

/** Called when a brand-new subscription row is inserted. */
export async function statsOnSubscriptionInsert(
    ctx: MutationCtx,
    status: SubStatus | undefined,
    isNewOrg: boolean,
) {
    const doc = await getSingleton(ctx);
    const byStatus = { ...doc.subscriptionsByStatus };
    if (status) byStatus[status]++;
    await ctx.db.patch(doc._id, {
        totalSubscriptions: doc.totalSubscriptions + 1,
        subscriptionsByStatus: byStatus,
        ...(isNewOrg ? { totalOrganizations: doc.totalOrganizations + 1 } : {}),
    });
}

/** Called when an existing subscription row is fully replaced (upsert → replace path). */
export async function statsOnSubscriptionReplace(
    ctx: MutationCtx,
    oldStatus: SubStatus | undefined,
    newStatus: SubStatus | undefined,
) {
    if (oldStatus === newStatus) return;
    const doc = await getSingleton(ctx);
    const byStatus = { ...doc.subscriptionsByStatus };
    if (oldStatus) byStatus[oldStatus] = Math.max(0, byStatus[oldStatus] - 1);
    if (newStatus) byStatus[newStatus]++;
    await ctx.db.patch(doc._id, { subscriptionsByStatus: byStatus });
}

/** Called when only the status field of a subscription changes. */
export async function statsOnSubscriptionStatusChange(
    ctx: MutationCtx,
    oldStatus: SubStatus | undefined,
    newStatus: SubStatus,
) {
    await statsOnSubscriptionReplace(ctx, oldStatus, newStatus);
}

/** Called when a new transaction row is inserted. */
export async function statsOnTransactionInsert(
    ctx: MutationCtx,
    status: TxStatus,
    amount: number,
) {
    const doc = await getSingleton(ctx);
    const byStatus = { ...doc.transactionsByStatus };
    byStatus[status]++;
    const revenueAdd = status === "succeeded" ? amount : 0;
    await ctx.db.patch(doc._id, {
        totalTransactions: doc.totalTransactions + 1,
        transactionsByStatus: byStatus,
        totalRevenueSmallestUnit: doc.totalRevenueSmallestUnit + revenueAdd,
    });
}

/** Called when an existing transaction's status changes. */
export async function statsOnTransactionStatusChange(
    ctx: MutationCtx,
    oldStatus: TxStatus,
    newStatus: TxStatus,
    amount: number,
) {
    if (oldStatus === newStatus) return;
    const doc = await getSingleton(ctx);
    const byStatus = { ...doc.transactionsByStatus };
    byStatus[oldStatus] = Math.max(0, byStatus[oldStatus] - 1);
    byStatus[newStatus]++;
    let revenueDelta = 0;
    if (newStatus === "succeeded" && oldStatus !== "succeeded") revenueDelta = amount;
    if (oldStatus === "succeeded" && newStatus !== "succeeded") revenueDelta = -amount;
    await ctx.db.patch(doc._id, {
        transactionsByStatus: byStatus,
        totalRevenueSmallestUnit: doc.totalRevenueSmallestUnit + revenueDelta,
    });
}

// ---------------------------------------------------------------------------
// Convex functions — used by actions that cannot inline DB calls directly.
// ---------------------------------------------------------------------------

/** Read the singleton (returns null if not yet initialised). */
export const get = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("adminStats")
            .withIndex("by_tag", (q) => q.eq("tag", "singleton"))
            .unique();
    },
});

/**
 * Recompute all counters from scratch.
 * Safe to call at any time; replaces the singleton atomically.
 * Invoke via `admin.rebuildStats` (action).
 */
export const rebuild = internalMutation({
    args: {},
    handler: async (ctx) => {
        const [users, subscriptions, transactions] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("subscriptions").collect(),
            ctx.db.query("transactions").collect(),
        ]);

        const uniqueOrgIds = new Set(subscriptions.map((s) => s.organizationId));

        const byStatus: Record<SubStatus, number> = {
            active: 0,
            cancelled: 0,
            expired: 0,
            past_due: 0,
            unpaid: 0,
        };
        for (const s of subscriptions) {
            if (s.status) byStatus[s.status]++;
        }

        const txByStatus: Record<TxStatus, number> = { pending: 0, succeeded: 0, failed: 0 };
        let totalRevenue = 0;
        for (const t of transactions) {
            txByStatus[t.status]++;
            if (t.status === "succeeded") totalRevenue += t.amount;
        }

        const newDoc = {
            tag: "singleton" as const,
            totalUsers: users.length,
            totalOrganizations: uniqueOrgIds.size,
            totalSubscriptions: subscriptions.length,
            subscriptionsByStatus: byStatus,
            totalTransactions: transactions.length,
            transactionsByStatus: txByStatus,
            totalRevenueSmallestUnit: totalRevenue,
        };

        const existing = await ctx.db
            .query("adminStats")
            .withIndex("by_tag", (q) => q.eq("tag", "singleton"))
            .unique();

        if (existing) {
            await ctx.db.replace(existing._id, newDoc);
        } else {
            await ctx.db.insert("adminStats", newDoc);
        }
    },
});
