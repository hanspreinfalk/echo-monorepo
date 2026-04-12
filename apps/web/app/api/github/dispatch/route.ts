import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@workspace/backend/_generated/api";

/** Must match `repository_dispatch.types` in the repo workflow. */
const REPOSITORY_DISPATCH_EVENT_TYPE = "echo_product_issue";

/** GitHub caps `client_payload`; stay under the limit with room for metadata. */
const MAX_PROMPT_LENGTH = 62_000;

type DispatchBody = {
  prompt?: string;
  issueId?: string;
};

export async function POST(request: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DispatchBody;
  try {
    body = (await request.json()) as DispatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawPrompt = typeof body.prompt === "string" ? body.prompt : "";
  const trimmed = rawPrompt.trim();
  if (!trimmed) {
    return NextResponse.json(
      { error: "Missing or empty `prompt`." },
      { status: 400 },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: Convex URL missing." },
      { status: 500 },
    );
  }

  const convexToken = await getToken({ template: "convex" });
  if (!convexToken) {
    return NextResponse.json(
      { error: "Could not verify session for Convex." },
      { status: 401 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  convex.setAuth(convexToken);

  let integration: {
    fullName: string;
    githubRepoId: number;
    defaultBranch: string;
    htmlUrl?: string;
  } | null;
  try {
    integration = await convex.query(api.private.githubIntegration.getOne, {});
  } catch {
    return NextResponse.json(
      { error: "Could not load GitHub settings for this organization." },
      { status: 502 },
    );
  }

  if (!integration?.fullName) {
    return NextResponse.json(
      {
        error:
          "No linked GitHub repository. Choose one under GitHub in the sidebar.",
      },
      { status: 400 },
    );
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github");
  const githubToken = tokens.data[0]?.token;

  if (!githubToken) {
    return NextResponse.json(
      {
        error:
          "GitHub not connected. Reconnect your GitHub account, then try again.",
      },
      { status: 400 },
    );
  }

  let prompt = trimmed;
  let truncated = false;
  if (prompt.length > MAX_PROMPT_LENGTH) {
    prompt = `${prompt.slice(0, MAX_PROMPT_LENGTH)}\n\n[truncated for GitHub payload limit]`;
    truncated = true;
  }

  const dispatchUrl = `https://api.github.com/repos/${integration.fullName}/dispatches`;
  const res = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "EchoDashboard/1.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: REPOSITORY_DISPATCH_EVENT_TYPE,
      client_payload: {
        prompt,
        issueId: body.issueId ?? null,
        repository: integration.fullName,
        defaultBranch: integration.defaultBranch,
      },
    }),
  });

  if (res.status === 204) {
    return NextResponse.json({
      ok: true,
      repository: integration.fullName,
      truncated,
      eventType: REPOSITORY_DISPATCH_EVENT_TYPE,
    });
  }

  const details = await res.text();
  if (res.status === 404) {
    return NextResponse.json(
      {
        error:
          "GitHub could not dispatch to this repository. Check that it exists and your account can push or administer it.",
        details,
      },
      { status: 404 },
    );
  }
  if (res.status === 403 || res.status === 401) {
    return NextResponse.json(
      {
        error:
          "GitHub denied dispatch. Ensure your connected account has repo access and (for fine-grained tokens) **Actions** read/write on this repository.",
        details,
      },
      { status: res.status },
    );
  }

  return NextResponse.json(
    {
      error: "GitHub dispatch failed.",
      details,
    },
    { status: 502 },
  );
}
