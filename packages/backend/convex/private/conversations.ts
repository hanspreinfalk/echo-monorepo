import { query, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc, Id } from "../_generated/dataModel";

export const updateStatus = mutation({
    args: {
        conversationId: v.id("conversations"),
        status: v.union(
            v.literal('unresolved'),
            v.literal('escalated'),
            v.literal('resolved')
        )
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            })
        }

        await ctx.db.patch(args.conversationId, {
            status: args.status
        })
    }
})

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            return null;
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            })
        }

        const contactSession = await ctx.db.get(conversation.contactSessionId);
        if (!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Contact session not found"
            })
        }

        return {
            ...conversation,
            contactSession
        };
    }
})

export const getMany = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(v.union(
            v.literal('unresolved'),
            v.literal('escalated'),
            v.literal('resolved')
        ))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        let conversations: PaginationResult<Doc<"conversations">>

        if (args.status) {
            conversations = await ctx.db
                .query('conversations')
                .withIndex("by_status_and_organization_id", (q) => 
                    q.eq("status", args.status as Doc<"conversations">["status"]).eq("organizationId", orgId)
                )
                .order("desc")
                .paginate(args.paginationOpts)
        } else {
            conversations = await ctx.db
                .query('conversations')
                .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
                .order("desc")
                .paginate(args.paginationOpts)
        }

        const conversationsWithAdditionalData = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null;

                const contactSession = await ctx.db.get(conversation.contactSessionId);
                if (!contactSession) {
                    return null;
                }

                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null },
                });

                if (messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }

                return {
                    ...conversation,
                    lastMessage,
                    contactSession,
                }
            })
        )

        const validConversations = conversationsWithAdditionalData.filter(
            (conv): conv is NonNullable<typeof conv> => conv !== null,
        );

        return {
            ...conversations,
            page: validConversations,
        }
    }
})

export const deleteConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            });
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            });
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            });
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            });
        }

        // Collect attachment storage IDs from all messages before deleting them
        const attachmentUrlRegex = /\[📎[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
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
                let match;
                const regex = new RegExp(attachmentUrlRegex.source, "g");
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
    }
});

export const getLatestPageControlRequest = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError({ code: "UNAUTHORIZED", message: "Identity not found" });

        const orgId = identity.orgId as string;
        if (!orgId) throw new ConvexError({ code: "UNAUTHORIZED", message: "No org ID" });

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation || conversation.organizationId !== orgId) return null;

        return await ctx.db
            .query("pageControlRequests")
            .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .first();
    },
})