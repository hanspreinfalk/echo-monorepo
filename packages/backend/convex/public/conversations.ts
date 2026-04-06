import { mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

export const getIsAiTyping = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }

        return conversation.isAiTyping;
    },
});

export const getMany = query({
    args: {
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_contact_session_id", (q) =>
                q.eq("contactSessionId", args.contactSessionId),
            )
            .order("desc")
            .paginate(args.paginationOpts);

        const conversationsWithLastMessage = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null;

                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null },
                });

                if (messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }

                return {
                    _id: conversation._id,
                    _creationTime: conversation._creationTime,
                    status: conversation.status,
                    organizationId: conversation.organizationId,
                    threadId: conversation.threadId,
                    lastMessage,
                };
            })
        );

        return {
            ...conversations,
            page: conversationsWithLastMessage,
        };
    },
});

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }

        if (conversation.contactSessionId !== session._id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Incorrect session",
            });
        }

        return {
            _id: conversation._id,
            status: conversation.status,
            threadId: conversation.threadId,
        };
    },
});

export const create = mutation({
    args: {
        organizationId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }

        // This refreshes the user's session if they are within the threshold
        await ctx.runMutation(internal.system.contactSessions.refresh, {
            contactSessionId: args.contactSessionId,
        });

        const widgetSettings = await ctx.db
            .query("widgetSettings")
            .withIndex("by_organization_id", (q) =>
                q.eq("organizationId", args.organizationId),
            )
            .unique();

        const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId,
        });

        await saveMessage(ctx, components.agent, {
            threadId,
            message: {
                role: "assistant",
                content: widgetSettings?.greetMessage || "Hello, how can I help you today?",
            },
        });

        const conversationId = await ctx.db.insert("conversations", {
            contactSessionId: session._id,
            status: "unresolved",
            organizationId: args.organizationId,
            threadId,
        });

        return conversationId;
    },
});

export const getPendingPageControlRequest = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);
        if (!session || session.expiresAt < Date.now()) return null;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation || conversation.contactSessionId !== args.contactSessionId) return null;

        return await ctx.db
            .query("pageControlRequests")
            .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();
    },
});

export const resolvePageControlRequest = mutation({
    args: {
        requestId: v.id("pageControlRequests"),
        contactSessionId: v.id("contactSessions"),
        decision: v.union(v.literal("approved"), v.literal("denied")),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);
        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new ConvexError({ code: "NOT_FOUND", message: "Request not found" });

        const conversation = await ctx.db.get(request.conversationId);
        if (!conversation || conversation.contactSessionId !== args.contactSessionId) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Forbidden" });
        }

        await ctx.db.patch(args.requestId, { status: args.decision });
    },
});