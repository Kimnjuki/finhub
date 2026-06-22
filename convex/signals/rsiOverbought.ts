// Signal for RSI overbought condition
import { action } from "./_generated/server";

export const checkRsiOverbought = action({
  async handler(ctx, args) {
    // TODO: Implement RSI overbought detection logic
    return { overbought: false };
  },
});