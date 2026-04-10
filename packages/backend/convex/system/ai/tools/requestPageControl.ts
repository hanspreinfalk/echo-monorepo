import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Id } from "../../../_generated/dataModel";

export const requestPageControl = createTool({
    description: "Request permission to interact with web page UI elements on behalf of the user — clicking buttons, filling inputs, or navigating within the current website. This is pure browser DOM automation, NOT computer/OS control. The user sees an approval dialog first and nothing happens without their explicit consent.",
    args: z.object({
        action: z.string().describe("Exact UI action to perform on the web page, e.g. 'Click the + button to increment the counter' or 'Fill the email field with the provided address and click Submit'"),
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
