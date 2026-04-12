import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@workspace/backend/_generated/api";

/** Matches workflow `name` in echo-product-issue.yml and the file path. */
const WORKFLOW_DISPLAY_NAMES = new Set(["Echo product issue"]);
const WORKFLOW_PATH_HINT = "echo-product-issue";

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "EchoDashboard/1.0",
  } as const;
}

function matchesEchoWorkflow(run: { name?: string; path?: string }) {
  const name = run.name ?? "";
  const path = run.path ?? "";
  return WORKFLOW_DISPLAY_NAMES.has(name) || path.includes(WORKFLOW_PATH_HINT);
}

/**
 * Poll workflow run status and job logs for the org-linked repo.
 * Query: `after` (ISO) to resolve the run from a recent repository_dispatch, or `runId` to refresh a known run.
 */
export async function GET(request: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const after = request.nextUrl.searchParams.get("after");
  const runIdParam = request.nextUrl.searchParams.get("runId");

  if (!after && !runIdParam) {
    return NextResponse.json(
      { error: "Missing `after` or `runId` query parameter." },
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

  let integration: { fullName: string } | null;
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

  const fullName = integration.fullName;
  let runId: number;

  if (runIdParam) {
    const parsed = Number.parseInt(runIdParam, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "Invalid runId." }, { status: 400 });
    }
    runId = parsed;
    const verifyRes = await fetch(
      `https://api.github.com/repos/${fullName}/actions/runs/${runId}`,
      { headers: githubHeaders(githubToken) },
    );
    if (!verifyRes.ok) {
      const details = await verifyRes.text();
      return NextResponse.json(
        { error: "Could not load workflow run.", details },
        { status: verifyRes.status === 404 ? 404 : 502 },
      );
    }
    const verifyRun = (await verifyRes.json()) as {
      repository?: { full_name?: string };
    };
    if (verifyRun.repository?.full_name !== fullName) {
      return NextResponse.json(
        { error: "Workflow run does not belong to the linked repository." },
        { status: 403 },
      );
    }
  } else {
    if (!after) {
      return NextResponse.json({ error: "Missing after." }, { status: 400 });
    }
    const afterMs = new Date(after).getTime();
    if (Number.isNaN(afterMs)) {
      return NextResponse.json({ error: "Invalid after timestamp." }, { status: 400 });
    }
    const threshold = afterMs - 15_000;

    const listRes = await fetch(
      `https://api.github.com/repos/${fullName}/actions/runs?event=repository_dispatch&per_page=30&exclude_pull_requests=true`,
      { headers: githubHeaders(githubToken) },
    );
    if (!listRes.ok) {
      const details = await listRes.text();
      return NextResponse.json(
        { error: "Could not list workflow runs.", details },
        { status: 502 },
      );
    }
    const listData = (await listRes.json()) as {
      workflow_runs?: Array<{
        id: number;
        name?: string;
        path?: string;
        created_at: string;
      }>;
    };
    const runs = listData.workflow_runs ?? [];
    const candidates = runs.filter((r) => {
      if (!matchesEchoWorkflow(r)) {
        return false;
      }
      const t = new Date(r.created_at).getTime();
      return t >= threshold;
    });
    candidates.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const chosen = candidates[0];
    if (!chosen) {
      return NextResponse.json({
        run: null,
        jobs: [] as unknown[],
        logText: "",
        logsSkippedZip: false,
      });
    }
    runId = chosen.id;
  }

  const runRes = await fetch(
    `https://api.github.com/repos/${fullName}/actions/runs/${runId}`,
    { headers: githubHeaders(githubToken) },
  );
  if (!runRes.ok) {
    const details = await runRes.text();
    return NextResponse.json(
      { error: "Could not load workflow run.", details },
      { status: 502 },
    );
  }
  const run = (await runRes.json()) as {
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
  };

  return NextResponse.json({
    run: {
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
    },
  });
}
