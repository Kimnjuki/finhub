// Signal for RSI neutral condition
import { defineAction } from "convex/server";
export const checkRsiNeutral = defineAction({
    async handler(ctx, args) {
        // TODO: Implement RSI neutral detection logic
        return { neutral: false };
    },
});
