// Signal for cross-exchange spread detection
import { defineAction } from "convex/server";
export const checkCrossExchangeSpread = defineAction({
    async handler(ctx, args) {
        // TODO: Implement cross-exchange spread detection logic
        return { spread: 0 };
    },
});
