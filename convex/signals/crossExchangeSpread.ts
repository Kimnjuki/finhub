// Signal for cross-exchange spread detection
import { action } from "convex/server";

export const checkCrossExchangeSpread = action({
  async handler(ctx: any, args: any) {
    // TODO: Implement cross-exchange spread detection logic
    return { spread: 0 };
  },
});