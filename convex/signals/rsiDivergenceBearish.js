// Signal for RSI bearish divergence detection
import { defineAction } from "convex/server";
export const checkRsiDivergenceBearish = defineAction({
    async handler(ctx, args) {
        // TODO: Implement RSI bearish divergence detection logic
        return { divergence: false };
    },
});
