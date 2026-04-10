import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Doc, Id } from "../../../_generated/dataModel";
import { supportAgent } from "../agents/supportAgent";

const issueCategorySchema = z.enum([
  "Bug",
  "UX",
  "Performance",
  "Accessibility",
  "Security",
  "Data",
]);

const issueCriticalitySchema = z.enum([
  "Critical",
  "High",
  "Medium",
  "Low",
]);

const attachmentSchema = z.object({
  url: z
    .string()
    .describe(
      "Direct HTTPS URL from the chat (e.g. user attachment markdown [name](url)); must be reachable",
    ),
  filename: z.string().optional().describe("Original file name if known from the message"),
  mimeType: z
    .string()
    .optional()
    .describe("MIME type if known (e.g. image/png, video/mp4)"),
});

const createIssueArgs = z.object({
  title: z.string().describe("Short, actionable issue title"),
  description: z
    .string()
    .describe(
      "What happened and expected vs actual. Keep reproduction steps out of this field—use **stepsToReproduce**.",
    ),
  stepsToReproduce: z
    .string()
    .optional()
    .describe(
      "Clear numbered or bullet steps to reproduce (1. … 2. …). Gather from the conversation across turns; include every step the customer described. Omit only if they never gave reproducible steps.",
    ),
  category: issueCategorySchema.describe("Issue category"),
  criticality: issueCriticalitySchema.describe("Severity for prioritization"),
  pageUrl: z
    .string()
    .optional()
    .describe(
      "Set from visitor environment when available: prefer **Host page URL**, else **Widget iframe URL**. Only omit if neither exists.",
    ),
  consoleLogs: z
    .array(z.string())
    .optional()
    .describe(
      "**Required workflow when the visitor uses the embed and you are filing a bug or error:** call **readConsoleLogsTool** first in this run (use a high \`lineCount\` if needed), then set this field to the **important** lines from that result—errors, \`uncaught error:\`, \`unhandled rejection:\`, warnings, multi-line stack traces or dumps (as separate lines or one string per logical line), and anything tied to the report (curate; omit noise). If **readConsoleLogsTool** returned no logs, omit or use only lines the customer pasted in chat. Do **not** rely only on the truncated visitor-environment console snippet.",
    ),
  attachments: z
    .array(attachmentSchema)
    .optional()
    .describe(
      "Every image/video URL the customer shared ([📎 name](url)). Include whenever attachments exist in messages.",
    ),
});

export const createIssue = createTool<typeof createIssueArgs, string>({
  description:
    "File a **new** product issue ONLY after follow-ups across multiple turns (one question per message). **Before this tool (same assistant turn):** (1) Call **listOpenIssuesTool** (titles/ids only). For any plausible duplicate title, call **readOpenIssueDetailsTool** with that **issueId** and compare full description, steps, **pageUrl**, and **consoleLogs** to the current report. If one is the **same defect**, call **appendSessionToIssueTool** instead—do **not** create a duplicate. (2) If the visitor environment includes **Host page console** or the issue is a technical bug/error on an embedded page, call **readConsoleLogsTool** first and pass **consoleLogs** with the important lines (uncaught/rejection lines, pasted stack traces). Set **pageUrl** from visitor environment when present; **attachments** from every 📎 link; **stepsToReproduce** from the customer's flow (numbered). Do not omit fields when data exists. Do not ask about device/browser. After enough detail, invite a screenshot in its own message if needed; when they are done, call this tool only when no open issue matches after **readOpenIssueDetailsTool**.",
  args: createIssueArgs,
  handler: async (ctx, args): Promise<string> => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation: Doc<"conversations"> | null = await ctx.runQuery(
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

    const affectedSessions =
      contactSession !== null ? [contactSession._id] : undefined;

    const issueId: Id<"issues"> = await ctx.runMutation(
      internal.system.issues.create,
      {
        organizationId: conversation.organizationId,
        conversationId: conversation._id,
        title: args.title,
        description: args.description,
        stepsToReproduce: args.stepsToReproduce,
        category: args.category,
        criticality: args.criticality,
        pageUrl: args.pageUrl,
        consoleLogs: args.consoleLogs,
        attachments: args.attachments,
        affectedSessions,
      },
    );

    // const customerMessage =
    //   args.attachments && args.attachments.length > 0
    //     ? "I've created an issue for our engineering team with the details and files you shared. They'll use it to track and fix the problem. Is there anything else I can help you with in the meantime?"
    //     : "I've created an issue for our engineering team with the details you shared. They'll use it to track and fix the problem. Is there anything else I can help you with in the meantime?";

    // await supportAgent.saveMessage(ctx, {
    //   threadId: ctx.threadId,
    //   message: {
    //     role: "assistant",
    //     content: customerMessage,
    //   },
    // });

    return `Success: issue ${issueId} created. You already posted the customer-facing reply in the thread; do not repeat it verbatim if you add another message.`;
  },
});
