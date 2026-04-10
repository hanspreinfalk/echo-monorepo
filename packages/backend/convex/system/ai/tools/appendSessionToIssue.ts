import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";
import { supportAgent } from "../agents/supportAgent";

export const appendSessionToIssue = createTool({
  description:
    "Link **this** visitor's contact session to an **existing open issue** when their report is the **same error or defect** as that issue (match using **listOpenIssuesTool**: same console error/stack line, same broken behavior and **pageUrl**, or same title/symptom). **Do not** use this for a genuinely new bug. After **listOpenIssuesTool**, if you find a match, call this **instead of** createIssueTool. Appends the current session to the issue's affected sessions for engineering visibility.",
  args: z.object({
    issueId: z
      .string()
      .describe(
        "Exact **issueId** string from listOpenIssuesTool (e.g. Convex id for issues table)",
      ),
    duplicateMatchSummary: z
      .string()
      .describe(
        "One short sentence: why this is the same issue (e.g. same uncaught error line and page)",
      ),
  }),
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

    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      { contactSessionId: conversation.contactSessionId },
    );

    if (!contactSession) {
      return "Contact session not found";
    }

    const result = await ctx.runMutation(internal.system.issues.appendAffectedSession, {
      issueId: args.issueId as Id<"issues">,
      organizationId: conversation.organizationId,
      contactSessionId: contactSession._id,
    });

    if (!result.ok) {
      return `Failed: ${result.error}`;
    }

    // const customerMessage = result.alreadyLinked
    //   ? "Your session was already tied to the engineering issue we're tracking for this problem. Is there anything else I can help you with?"
    //   : "I've added your visit to the engineering issue we're already tracking for this problem, so our team has your context. Is there anything else I can help you with in the meantime?";

    // await supportAgent.saveMessage(ctx, {
    //   threadId: ctx.threadId,
    //   message: {
    //     role: "assistant",
    //     content: customerMessage,
    //   },
    // });

    return result.alreadyLinked
      ? `Success: session was already linked to issue ${args.issueId}. You already posted the customer-facing reply; do not repeat it verbatim if you add another message.`
      : `Success: appended this session to issue ${args.issueId} (${args.duplicateMatchSummary}). You already posted the customer-facing reply; do not repeat it verbatim if you add another message.`;
  },
});
