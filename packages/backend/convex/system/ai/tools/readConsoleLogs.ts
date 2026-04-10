import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";

const readConsoleLogsArgs = z.object({
  lineCount: z
    .number()
    .int()
    .min(1)
    .max(300)
    .optional()
    .describe(
      "Number of most recent host-page console lines to return (default 80). Up to 300 may be stored on the session.",
    ),
});

export const readConsoleLogs = createTool<typeof readConsoleLogsArgs, string>({
  description:
    "Load host-page console lines captured by the Echo embed for this visitor. The system prompt may only include a short tail; use this when you need more lines, fresher data, or to copy exact text into createIssueTool. After the tool returns, you must still reply to the customer in plain language (this tool does not send them a chat message).",
  args: readConsoleLogsArgs,
  handler: async (ctx, args): Promise<string> => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const contactSession = await ctx.runQuery(internal.system.contactSessions.getOne, {
      contactSessionId: conversation.contactSessionId,
    });

    if (!contactSession) {
      return "Contact session not found";
    }

    const logs = contactSession.metadata?.hostConsoleLogs;
    if (logs === undefined || logs.length === 0) {
      return "No host console logs are stored for this session. The visitor may not be on a page with the embed, or no output has been captured yet.";
    }

    const lineCount = args.lineCount ?? 80;
    const slice = logs.slice(-lineCount);
    const header = `Host page console: showing ${slice.length} line(s), newest at the bottom (of ${logs.length} stored).\n\n`;
    const body = slice.map((line, i) => `${String(i + 1).padStart(4, " ")}  ${line}`).join("\n");
    return header + body;
  },
});
