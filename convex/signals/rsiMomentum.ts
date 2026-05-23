// Signal for RSI momentum detection
import { defineAction, action, defineQuery, query } from "convex/server";

export const checkRsiMomentum = defineAction({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI momentum detection logic
    return { momentum: 0 };
  },
});