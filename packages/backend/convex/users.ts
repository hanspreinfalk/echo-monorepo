import { mutation, query } from "./_generated/server";
import { statsIncrUsers } from "./system/adminStats";

function parseBootstrapAdminIds(): Set<string> {
    const raw = process.env.ECHO_BOOTSTRAP_ADMIN_CLERK_IDS ?? "";
    return new Set(
        raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    );
}

export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            return null;
        }

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
            .unique();
    },
});

/** Ensures a Convex `users` row exists for the signed-in Clerk user; inserts only when missing. */
export const ensureCurrentUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            return null;
        }

        const clerkUserId = identity.subject;
        const name =
            identity.name ??
            identity.email ??
            identity.nickname ??
            "User";
        const email =
            typeof identity.email === "string" ? identity.email : undefined;

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name,
                ...(email !== undefined ? { email } : {}),
            });
            return existing._id;
        }

        const bootstrap = parseBootstrapAdminIds();
        const role = bootstrap.has(clerkUserId) ? ("admin" as const) : ("user" as const);

        const id = await ctx.db.insert("users", {
            name,
            clerkUserId,
            ...(email !== undefined ? { email } : {}),
            role,
        });
        await statsIncrUsers(ctx);
        return id;
    },
});
