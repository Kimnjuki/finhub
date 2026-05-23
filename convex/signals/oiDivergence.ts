// Signal for open interest divergence detection
import { defineAction, action, defineQuery, query } from "convex/server";

export const checkOiDivergence = defineAction({
  async handler(ctx: any, args: any) {
    // TODO: Implement open interest divergence detection logic
    return { divergence: false };
  },
});