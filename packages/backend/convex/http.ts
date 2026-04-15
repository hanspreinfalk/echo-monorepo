import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { embedOpenaiCors, embedOpenaiProxy } from "./embedOpenai";
import {
  embedWidgetAppearanceGet,
  embedWidgetAppearanceOptions,
} from "./embedWidgetAppearance";
import { customToolTest } from "./customToolTestHttp";

const http = httpRouter();

http.route({
  path: "/embed/openai/v1/chat/completions",
  method: "OPTIONS",
  handler: embedOpenaiCors,
});
http.route({
  path: "/embed/openai/v1/chat/completions",
  method: "POST",
  handler: embedOpenaiProxy,
});

http.route({
  path: "/embed/widget-appearance",
  method: "OPTIONS",
  handler: embedWidgetAppearanceOptions,
});
http.route({
  path: "/embed/widget-appearance",
  method: "GET",
  handler: embedWidgetAppearanceGet,
});

for (const method of ["GET", "POST", "PUT", "PATCH"] as const) {
  http.route({
    path: "/custom-tool-test",
    method,
    handler: customToolTest,
  });
}

http.route({
  path: "/api/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", {
        status: 400,
      });
    }

    const payload = await request.text();

    if (!payload) {
      return new Response("Empty payload", {
        status: 400,
      });
    }

    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload,
    });

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      console.error("Webhook processing failed:", result.error);
      return new Response(result.error || "Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;