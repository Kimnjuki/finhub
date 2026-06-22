// Signal for open interest divergence detection
import { defineAction } from "convex/server";
export const checkOiDivergence = defineAction({
    async handler(ctx, args) {
        // TODO: Implement open interest divergence detection logic
        return { divergence: false };
    },
});
