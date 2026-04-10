import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/ai/tools/search";
import { readAttachment } from "../system/ai/tools/readAttachment";
import { requestPageControl } from "../system/ai/tools/requestPageControl";
import { appendSessionToIssue } from "../system/ai/tools/appendSessionToIssue";
import { createIssue } from "../system/ai/tools/createIssue";
import { listOpenIssues } from "../system/ai/tools/listOpenIssues";
import { readConsoleLogs } from "../system/ai/tools/readConsoleLogs";
import { formatVisitorContextForAgent } from "../system/ai/visitorContext";
import { supportAgentSystemWithVisitorContext } from "../system/ai/constants";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      },
    );

    if (!conversation) {
      return null;
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    // This refreshes the user's session if they are within the threshold
    await ctx.runMutation(internal.system.contactSessions.refresh, {
      contactSessionId: args.contactSessionId,
    });

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      {
        organizationId: conversation.organizationId,
      },
    );

    const shouldTriggerAgent =
      conversation.status === "unresolved" && subscription?.status === "active"

    if (shouldTriggerAgent) {
      const { messageId } = await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      });

      const contactSession = await ctx.runQuery(
        internal.system.contactSessions.getOne,
        { contactSessionId: conversation.contactSessionId },
      );

      const visitorContext =
        contactSession !== null
          ? formatVisitorContextForAgent(contactSession)
          : "";
      const system =
        visitorContext.trim().length > 0
          ? supportAgentSystemWithVisitorContext(visitorContext)
          : undefined;

      await ctx.runMutation(internal.system.conversations.updateIsAiTyping, {
        conversationId: conversation._id,
        isAiTyping: true,
      });

      await supportAgent.generateText(
        ctx,
        { threadId: args.threadId },
        {
          promptMessageId: messageId,
          ...(system !== undefined ? { system } : {}),
          tools: {
            escalateConversationTool: escalateConversation,
            resolveConversationTool: resolveConversation,
            searchTool: search,
            readAttachmentTool: readAttachment,
            readConsoleLogsTool: readConsoleLogs,
            listOpenIssuesTool: listOpenIssues,
            appendSessionToIssueTool: appendSessionToIssue,
            createIssueTool: createIssue,
            ...(subscription?.status === "active"
              ? { requestPageControlTool: requestPageControl }
              : {}),
          },
        },
      )

      await ctx.runMutation(internal.system.conversations.updateIsAiTyping, {
        conversationId: conversation._id,
        isAiTyping: false,
      });
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      });
    }
  },
});

export const storeAttachment = action({
  args: {
    bytes: v.bytes(),
    filename: v.string(),
    mimeType: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      { contactSessionId: args.contactSessionId },
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
    }

    const blob = new Blob([args.bytes], { type: args.mimeType || "application/octet-stream" });
    const storageId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(storageId);

    return { storageId: storageId as string, url };
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    return paginated;
  },
});