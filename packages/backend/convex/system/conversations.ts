import { internalQuery, internalMutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";

export const escalate = internalMutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        await ctx.db.patch(conversation._id, {
            status: "escalated"
        })
    },
})

export const resolve = internalMutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db 
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        await ctx.db.patch(conversation._id, {
            status: "resolved"
        })
    },
})

export const getByThreadId = internalQuery({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db 
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();
            
        return conversation;
    },
});

export const createPageControlRequest = internalMutation({
    args: {
        threadId: v.string(),
        action: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();

        if (!conversation) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
        }

        return await ctx.db.insert("pageControlRequests", {
            conversationId: conversation._id,
            action: args.action,
            status: "pending",
        });
    },
});

export const addPageControlStep = internalMutation({
    args: {
        requestId: v.id("pageControlRequests"),
        step: v.object({ stepIndex: v.number(), goal: v.string(), actionName: v.string() }),
    },
    handler: async (ctx, args) => {
        const req = await ctx.db.get(args.requestId);
        if (!req) return;
        await ctx.db.patch(args.requestId, {
            steps: [...(req.steps ?? []), args.step],
        });
    },
});

export const setPageControlResult = internalMutation({
    args: {
        requestId: v.id("pageControlRequests"),
        result: v.object({ success: v.boolean(), data: v.string() }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { result: args.result });
    },
});

export const updateIsAiTyping = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        isAiTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            isAiTyping: args.isAiTyping,
        });
    },
});