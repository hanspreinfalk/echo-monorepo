import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMany = query({
    args: {},
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();
        return users;
    },
});