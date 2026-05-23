// Signal for RSI bullish condition
import { defineAction, action, defineQuery, query } from "convex/server";

export const checkRsiBullish = defineAction({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI bullish detection logic
    return { bullish: false };
  },
});