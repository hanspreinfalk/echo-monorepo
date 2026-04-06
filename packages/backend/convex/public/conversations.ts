import { mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { Id } from "../_generated/dataModel";

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

export const getPageControlRequests = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);
        if (!session || session.expiresAt < Date.now()) return [];

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation || conversation.contactSessionId !== args.contactSessionId) return [];

        return await ctx.db
            .query("pageControlRequests")
            .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
            .collect();
    },
});

export const addPageControlStep = mutation({
    args: {
        requestId: v.id("pageControlRequests"),
        contactSessionId: v.id("contactSessions"),
        step: v.object({ stepIndex: v.number(), goal: v.string(), actionName: v.string() }),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);
        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
        }
        const req = await ctx.db.get(args.requestId);
        if (!req) throw new ConvexError({ code: "NOT_FOUND", message: "Request not found" });
        const conversation = await ctx.db.get(req.conversationId);
        if (!conversation || conversation.contactSessionId !== args.contactSessionId) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Forbidden" });
        }
        await ctx.db.patch(args.requestId, {
            steps: [...(req.steps ?? []), args.step],
        });
    },
});

export const setPageControlResult = mutation({
    args: {
        requestId: v.id("pageControlRequests"),
        contactSessionId: v.id("contactSessions"),
        result: v.object({ success: v.boolean(), data: v.string() }),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);
        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
        }
        const req = await ctx.db.get(args.requestId);
        if (!req) throw new ConvexError({ code: "NOT_FOUND", message: "Request not found" });
        const conversation = await ctx.db.get(req.conversationId);
        if (!conversation || conversation.contactSessionId !== args.contactSessionId) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Forbidden" });
        }
        await ctx.db.patch(args.requestId, { result: args.result });
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

export const deleteConversation = mutation({
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

        if (conversation.contactSessionId !== args.contactSessionId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Forbidden",
            });
        }

        // Collect attachment storage IDs from all messages before deleting them
        const storageIds: string[] = [];
        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const result = await supportAgent.listMessages(ctx, {
                threadId: conversation.threadId,
                paginationOpts: { numItems: 50, cursor },
            });

            for (const msg of result.page) {
                const text = msg.text ?? "";
                const regex = /\[📎[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const url = match[1];
                    if (url) {
                        const urlParts = url.split("/");
                        const storageId = urlParts[urlParts.length - 1];
                        if (storageId) storageIds.push(storageId);
                    }
                }
            }

            cursor = result.continueCursor;
            isDone = result.isDone;
        }

        // Delete attachment storage files
        for (const storageId of storageIds) {
            try {
                await ctx.storage.delete(storageId as Id<"_storage">);
            } catch {
                // File may have already been deleted or not found
            }
        }

        // Delete page control requests for this conversation
        const pageControlRequests = await ctx.db
            .query("pageControlRequests")
            .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const request of pageControlRequests) {
            await ctx.db.delete(request._id);
        }

        // Delete all thread messages asynchronously
        await supportAgent.deleteThreadAsync(ctx, { threadId: conversation.threadId });

        // Delete the conversation record itself
        await ctx.db.delete(args.conversationId);
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