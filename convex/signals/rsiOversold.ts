import { action } from "convex/server";
import { v } from "convex/values";

function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];
  const rsis: number[] = [];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff);
  }
  avgGain /= period; avgLoss /= period;
  rsis.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsis.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return rsis;
}

export const checkRsiOversold = action({
  args: { prices: v.array(v.float64()), period: v.optional(v.float64()), threshold: v.optional(v.float64()) },
  async handler(ctx: any, args: any) {
    const period = args.period || 14;
    const threshold = args.threshold || 30;
    const rsis = calculateRSI(args.prices, period);
    if (rsis.length === 0) return { signal: false, rsiValue: 0, threshold, strength: "none" as const };
    const currentRsi = rsis[rsis.length - 1];
    const signal = currentRsi < threshold;
    const strength = signal ? (currentRsi < threshold - 15 ? "strong" : currentRsi < threshold - 10 ? "moderate" : "weak") : "none";
    return { signal, rsiValue: currentRsi, threshold, strength };
  },
});