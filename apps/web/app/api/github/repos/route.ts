import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type GitHubRepoRow = {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
};

function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }
  for (const segment of linkHeader.split(",")) {
    const match = segment.match(/<([^>]+)>;\s*rel="next"/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github");
  const githubToken = tokens.data[0]?.token;

  if (!githubToken) {
    return NextResponse.json(
      {
        error:
          "GitHub not connected. Please reconnect your GitHub account.",
      },
      { status: 400 },
    );
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${githubToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "EchoDashboard/1.0",
  };

  const repos: GitHubRepoRow[] = [];
  let url: string | null =
    "https://api.github.com/user/repos?per_page=100&sort=full_name&affiliation=owner,collaborator,organization_member";

  try {
    while (url !== null && repos.length < 1000) {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const details = await res.text();
        return NextResponse.json(
          {
            error: "Failed to load repositories from GitHub.",
            details,
          },
          { status: res.status === 401 ? 401 : 502 },
        );
      }

      const page = (await res.json()) as GitHubRepoRow[];
      for (const r of page) {
        repos.push({
          id: r.id,
          full_name: r.full_name,
          name: r.name,
          private: r.private,
          default_branch: r.default_branch,
          html_url: r.html_url,
        });
      }

      url = parseNextLink(res.headers.get("link"));
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to load repositories from GitHub." },
      { status: 502 },
    );
  }

  return NextResponse.json({ repos });
}
