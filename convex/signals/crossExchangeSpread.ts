// Signal for cross-exchange spread detection
import { defineAction, action, defineQuery, query } from "convex/server";

export const checkCrossExchangeSpread = defineAction({
  async handler(ctx: any, args: any) {
    // TODO: Implement cross-exchange spread detection logic
    return { spread: 0 };
  },
});