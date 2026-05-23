// Signal for RSI oversold condition
import { defineAction, action, defineQuery, query } from "convex/server";

export const checkRsiOversold = defineAction({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI oversold detection logic
    return { oversold: false };
  },
});