import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";

export const requestPageControl = createTool({
    description:
        "Request permission ONCE so browser automation can complete the user's FULL task in one approved flow (navigation, multiple clicks, filling every field, submit). The user gets a single Accept/Deny—not one per step. Pure DOM automation on the current website, NOT computer/OS control. Do NOT call this tool again for the same goal to 'continue' after navigation or opening a dialog; put the entire workflow into one action string instead.",
    args: z.object({
        action: z.string().describe(
            "One complete instruction covering the whole workflow in order: every navigation (e.g. sidebar/menu), every button to open forms, every field and value, and final submit. Example: 'Open Patients from the sidebar, click Add Patient, set first name to X, last name to Y, date of birth to Z, gender to W, submit.' Wrong: calling the tool three times for sidebar, then add button, then form.",
        ),
    }),
    handler: async (ctx, args): Promise<string> => {
        if (!ctx.threadId) return "Missing thread ID";

        const requestId: Id<"pageControlRequests"> = await ctx.runMutation(
            internal.system.conversations.createPageControlRequest,
            {
                threadId: ctx.threadId,
                action: args.action,
            },
        );

        return JSON.stringify({
            pageControlRequestId: requestId,
            message:
                "Page control request sent to the user. Wait for their approval before proceeding.",
        });
    },
});
