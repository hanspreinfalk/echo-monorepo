import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Whether the signed-in user has a GitHub OAuth token (required for dispatch + repo list). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github");
  const githubToken = tokens.data[0]?.token;

  return NextResponse.json({ connected: Boolean(githubToken) });
}
