// Signal for arbitrage opportunities between exchanges
import { defineAction } from "convex/server";
export const checkArbitrage = defineAction({
    async handler(ctx, args) {
        // TODO: Implement arbitrage detection logic
        return { opportunities: [] };
    },
});
