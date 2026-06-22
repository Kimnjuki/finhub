// Signal for RSI oversold condition
import { defineAction } from "convex/server";
export const checkRsiOversold = defineAction({
    async handler(ctx, args) {
        // TODO: Implement RSI oversold detection logic
        return { oversold: false };
    },
});
