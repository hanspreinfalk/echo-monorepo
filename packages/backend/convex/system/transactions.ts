import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { ConvexError } from "convex/values";
import { statsOnTransactionInsert, statsOnTransactionStatusChange } from "./adminStats";

export const insert = internalMutation({
  args: {
    organizationId: v.string(),
    subscriptionId: v.id("subscriptions"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('succeeded'),
      v.literal('failed')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("transactions", {
        organizationId: args.organizationId,
        subscriptionId: args.subscriptionId,
        amount: args.amount,
        currency: args.currency,
        status: args.status,
      });
    await statsOnTransactionInsert(ctx, args.status, args.amount);
  },
});

export const updateStatus = internalMutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.union(
      v.literal('pending'),
      v.literal('succeeded'),
      v.literal('failed')
    ),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

      if (!transaction) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const oldStatus = transaction.status;
      const amount = transaction.amount;
      await ctx.db.patch(transaction._id, { status: args.status });
      await statsOnTransactionStatusChange(ctx, oldStatus, args.status, amount);
  },
})

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const getByStatus = internalQuery({
    args: {
        status: v.union(
            v.literal('pending'),
            v.literal('succeeded'),
            v.literal('failed')
        )
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("transactions")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();
    }
})