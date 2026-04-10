import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";

export const readOpenIssueDetails = createTool({
  description:
    "Load **full details** of one **unresolved** issue by **issueId** (from **listOpenIssuesTool**). Use after listing open issues: if the customer's report might match an existing issue (similar title/symptom), call this for each plausible **issueId** to compare **description**, **stepsToReproduce**, **pageUrl**, and **consoleLogs** with the current case. If it is the **same underlying defect**, call **appendSessionToIssueTool**; if none match after checking candidates, call **createIssueTool**. Does not message the customer.",
  args: z.object({
    issueId: z
      .string()
      .describe(
        "Exact **issueId** from **listOpenIssuesTool** (Convex id for the issues table)",
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

    const detail = await ctx.runQuery(
      internal.system.issues.getOpenIssueDetailsForOrganization,
      {
        organizationId: conversation.organizationId,
        issueId: args.issueId as Id<"issues">,
      },
    );

    if (detail === null) {
      return "No open issue found for that id (wrong id, resolved, or not in this organization). Pick another candidate from listOpenIssuesTool or create a new issue.";
    }

    return JSON.stringify(detail, null, 2);
  },
});
