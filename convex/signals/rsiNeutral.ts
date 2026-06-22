// Signal for RSI neutral condition
import { action } from "convex/server";

export const checkRsiNeutral = action({
  async handler(ctx: any, args: any) {
    // TODO: Implement RSI neutral detection logic
    return { neutral: false };
  },
});