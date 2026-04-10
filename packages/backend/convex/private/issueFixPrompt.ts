import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ISSUE_FIX_PROMPT_GENERATOR_SYSTEM } from "../system/ai/constants";

export const generateFixPrompt = action({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const cached = await ctx.runQuery(
      internal.system.issues.getCachedFixPrompt,
      { organizationId: orgId, issueId: args.issueId },
    );
    if (cached !== null) {
      return cached;
    }

    const payload = await ctx.runQuery(
      internal.system.issues.getContextForFixPrompt,
      { organizationId: orgId, issueId: args.issueId },
    );

    if (payload === null) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Issue not found",
      });
    }

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: ISSUE_FIX_PROMPT_GENERATOR_SYSTEM,
        },
        {
          role: "user",
          content: `Issue payload (JSON):\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const text = response.text;
    await ctx.runMutation(internal.system.issues.setFixPrompt, {
      organizationId: orgId,
      issueId: args.issueId,
      fixPrompt: text,
    });

    return text;
  },
});
