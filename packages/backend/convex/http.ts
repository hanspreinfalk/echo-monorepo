import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { embedOpenaiCors, embedOpenaiProxy } from "./embedOpenai";
import {
  embedWidgetAppearanceGet,
  embedWidgetAppearanceOptions,
} from "./embedWidgetAppearance";
import { customToolTest } from "./customToolTestHttp";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});

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
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);

    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    switch (event.type) {
      case "subscription.updated": {
        const subscription = event.data as {
          status: string;
          payer?: {
            organization_id: string;
          }
        };

        const organizationId = subscription.payer?.organization_id;

        if (!organizationId) {
          return new Response("Missing Organization ID", { status: 400 });
        }

        const newMaxAllowedMemberships = subscription.status === "active" ? 5 : 1;

        await clerkClient.organizations.updateOrganization(organizationId, {
          maxAllowedMemberships: newMaxAllowedMemberships,
        });

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId,
          status: subscription.status,
        });

        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error(`Error verifying webhook event`, error);
    return null;
  }
};

export default http;