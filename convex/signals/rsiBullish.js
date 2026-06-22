// Signal for RSI bullish condition
import { defineAction } from "convex/server";
export const checkRsiBullish = defineAction({
    async handler(ctx, args) {
        // TODO: Implement RSI bullish detection logic
        return { bullish: false };
    },
});
