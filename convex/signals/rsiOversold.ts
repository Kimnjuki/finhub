// Signal for RSI oversold condition
import { action } from "convex/server";

export const checkRsiOversold = action({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI oversold detection logic
    return { oversold: false };
  },
});