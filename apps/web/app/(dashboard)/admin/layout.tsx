import { auth } from "@clerk/nextjs/server";
import { api } from "@workspace/backend/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    redirect("/conversations");
  }

  const convexToken = await getToken({ template: "convex" });
  if (!convexToken) {
    redirect("/conversations");
  }

  const convex = new ConvexHttpClient(convexUrl);
  convex.setAuth(convexToken);

  const me = await convex.query(api.users.getMe, {});

  if (!me || me.role !== "admin") {
    redirect("/conversations");
  }

  return <>{children}</>;
}
