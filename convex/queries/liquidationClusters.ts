// convex/queries/liquidationClusters.ts
// Queries for liquidation heatmap data

import { v } from "convex/values";
import { query } from "../_generated/server";

export const getForInstrument = query({
  args: {
    instrumentId: v.optional(v.string()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    if (args.instrumentId) {
      return await ctx.db
        .query("liquidationClusters")
        .withIndex("by_instrument", (q: any) =>
          q.eq("instrumentId", args.instrumentId!)
        )
        .order("desc")
        .take(limit);
    }

    // Get most recent clusters across all instruments
    return await ctx.db
      .query("liquidationClusters")
      .order("desc")
      .take(limit);
  },
});

export const getLargestByValue = query({
  args: {
    limit: v.optional(v.float64()),
    minValueUsd: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const clusters = await ctx.db
      .query("liquidationClusters")
      .order("desc")
      .take(100);

    const filtered = args.minValueUsd
      ? clusters.filter((c: any) => c.totalLiquidationsUsd >= args.minValueUsd!)
      : clusters;

    return filtered.slice(0, limit);
  },
});