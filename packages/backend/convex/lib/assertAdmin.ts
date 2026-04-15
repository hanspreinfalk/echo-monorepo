import type { MutationCtx, QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Not signed in",
        });
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
        .unique();

    if (!user || user.role !== "admin") {
        throw new ConvexError({
            code: "FORBIDDEN",
            message: "Admin only",
        });
    }

    return user;
}
