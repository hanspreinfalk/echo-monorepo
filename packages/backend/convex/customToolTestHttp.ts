import { httpAction } from "./_generated/server";

/**
 * Echo endpoint for testing Custom Tools from the support agent.
 *
 * URL (after deploy): https://<your-deployment>.convex.site/custom-tool-test
 * Set CUSTOM_TOOL_TEST_SECRET in Convex env to require either:
 * - Header `Authorization: Bearer <secret>` or
 * - Header `x-custom-tool-test-secret: <secret>`
 */
export const customToolTest = httpAction(async (_ctx, request) => {
  // const secret = process.env.CUSTOM_TOOL_TEST_SECRET;
  const secret = "123"
  if (secret) {
    const auth = request.headers.get("authorization");
    const headerSecret = request.headers.get("x-custom-tool-test-secret");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
    if (token !== secret && headerSecret !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const method = request.method;
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  let body: unknown;
  if (method === "GET" || method === "HEAD") {
    body = undefined;
  } else {
    const text = await request.text();
    if (!text) {
      body = {};
    } else {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = { raw: text };
      }
    }
  }

  const payload = {
    ok: true,
    message: "Custom tool test echo — the agent reached this endpoint.",
    method,
    ...(Object.keys(query).length > 0 ? { query } : {}),
    ...(body !== undefined ? { body } : {}),
  };

  console.log("[custom-tool-test]", JSON.stringify(payload));

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
});
