import { createTool } from "@convex-dev/agent";
import z from "zod";
import { supportAgent } from "../agents/supportAgent";
import { internal } from "../../../_generated/api";

export const escalateConversation = createTool({
    description: "Escalate a conversation",
    args: z.object({
        reason: z.string().optional(),
    }),
    handler: async (ctx, args) => {
        if (!ctx.threadId) {
            return "Missing thread ID"
        }

        await ctx.runMutation(internal.system.conversations.escalate, {
            threadId: ctx.threadId,
        })

        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId,
            message: {
                role: "assistant",
                content: "Conversation escalated to a human operator"
            }
        })

        return "Conversation escalated to a human operator"
    },
})