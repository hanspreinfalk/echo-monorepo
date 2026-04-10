import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";

export const listOpenIssues = createTool({
  description:
    "List **unresolved** engineering issues for this organization (**issueId** and **title** only). **Call in the same turn before createIssueTool** when filing a bug or error. Scan titles for possible duplicates; for any plausible match, call **readOpenIssueDetailsTool** with that **issueId** to load full description, steps, **pageUrl**, and **consoleLogs** before deciding **appendSessionToIssueTool** vs **createIssueTool**. Does not message the customer.",
  args: z.object({}),
  handler: async (ctx): Promise<string> => {
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

    const rows = await ctx.runQuery(
      internal.system.issues.listUnresolvedForOrganization,
      { organizationId: conversation.organizationId },
    );

    if (rows.length === 0) {
      return "No open (unresolved) issues for this organization. You may create a new issue with createIssueTool if appropriate.";
    }

    return JSON.stringify(rows, null, 2);
  },
});
