// Signal for RSI bullish divergence detection
import { defineAction } from "convex/server";
export const checkRsiDivergenceBullish = defineAction({
    async handler(ctx, args) {
        // TODO: Implement RSI bullish divergence detection logic
        return { divergence: false };
    },
});
