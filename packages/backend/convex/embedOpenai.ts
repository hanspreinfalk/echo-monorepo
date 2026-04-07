import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const corsHeaders = (): Record<string, string> => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

/** CORS preflight for the embed script (third-party origins). */
export const embedOpenaiCors = httpAction(async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
});

/**
 * OpenAI-compatible proxy for the host-page PageAgent.
 * Authorization: Bearer <organizationId> (interim; replace with signed tokens later).
 */
export const embedOpenaiProxy = httpAction(async (ctx, request) => {
  const headers = corsHeaders();

  const auth = request.headers.get("authorization");
  const organizationId =
    auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;

  if (!organizationId) {
    return new Response(JSON.stringify({ error: "Missing or invalid Authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }

  const subscription = await ctx.runQuery(
    internal.system.subscriptions.getByOrganizationId,
    { organizationId },
  );

  if (subscription?.status !== "active") {
    return new Response(JSON.stringify({ error: "Subscription required" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: request.body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...headers,
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
});
