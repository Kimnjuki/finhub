// Signal for RSI oversold condition
export const checkRsiOversold = defineAction({
  async handler(ctx, args) {
    // TODO: Implement RSI oversold detection logic
    return { oversold: false };
  },
});