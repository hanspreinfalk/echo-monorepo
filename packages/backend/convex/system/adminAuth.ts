import { internalQuery } from "../_generated/server";
import { requireAdmin } from "../lib/assertAdmin";

/** Server-only admin check for actions and other internal callers. */
export const verify = internalQuery({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return true;
    },
});
