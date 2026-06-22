// Signal for RSI bullish condition
import { action } from "convex/server";

export const checkRsiBullish = action({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI bullish detection logic
    return { bullish: false };
  },
});