// ingestFundingRate.ts
// Convex mutation to ingest funding rate data

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const ingestFundingRate = mutation({
  args: {
    instrumentId: v.string(),
    sourceId: v.string(),
    fundingRate: v.float64(),
    fundingTime: v.float64(),
    predictedRate: v.optional(v.float64()),
    tsUtc: v.float64(),
  },
  handler: async (ctx, args) => {
    const annualizedRate = args.fundingRate * 3 * 365 * 100;

    await ctx.db.insert("fundingRates", {
      instrumentId: args.instrumentId,
      sourceId: args.sourceId,
      fundingRate: args.fundingRate,
      fundingTime: args.fundingTime,
      predictedRate: args.predictedRate,
      tsUtc: args.tsUtc,
      annualizedRate,
    });

    return {
      success: true,
      annualizedRate,
    };
  },
});