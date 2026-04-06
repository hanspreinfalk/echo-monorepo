import { openai } from "@ai-sdk/openai";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { supportAgent } from "../agents/supportAgent";

export const readAttachment = createTool({
    description: "Read an attached file and answer a question about its contents",
    args: z.object({
        url: z.string().describe("The URL of the attachment to read"),
        query: z.string().describe("The specific question to answer based on the file contents"),
    }),
    handler: async (ctx, args) => {
        if (!ctx.threadId) {
            return "Missing thread ID";
        }

        const response = await fetch(args.url);
        const contentType = response.headers.get("content-type") ?? "application/octet-stream";

        let result;
        if (contentType.startsWith("image/")) {
            result = await generateText({
                model: openai.chat("gpt-4o-mini"),
                messages: [{
                    role: "user",
                    content: [
                        { type: "image", image: new URL(args.url) },
                        { type: "text", text: args.query },
                    ],
                }],
            });
        } else {
            const text = await response.text();
            result = await generateText({
                model: openai.chat("gpt-4o-mini"),
                messages: [
                    { role: "system", content: "Answer the user's question based on the provided file contents." },
                    { role: "user", content: `File contents:\n${text}\n\nQuestion: ${args.query}` },
                ],
            });
        }

        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId,
            message: { role: "assistant", content: result.text },
        });

        return result.text;
    },
});
