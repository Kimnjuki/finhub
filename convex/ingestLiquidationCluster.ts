// ingestLiquidationCluster.ts
// Convex mutation to upsert a liquidation cluster

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertLiquidationCluster = mutation({
  args: {
    instrumentId: v.string(),
    priceBucket: v.float64(),
    bucketSizeUsd: v.float64(),
    longLiquidationsUsd: v.float64(),
    shortLiquidationsUsd: v.float64(),
    tradeCount: v.float64(),
    tsUtc: v.float64(),
    windowSeconds: v.float64(),
  },
  handler: async (ctx, args) => {
    const totalLiquidationsUsd = args.longLiquidationsUsd + args.shortLiquidationsUsd;

    // Try to find existing cluster for this instrument + bucket
    const existing = await ctx.db
      .query("liquidationClusters")
      .withIndex("by_instrument_bucket", (q: any) =>
        q.eq("instrumentId", args.instrumentId).eq("priceBucket", args.priceBucket)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        longLiquidationsUsd: args.longLiquidationsUsd,
        shortLiquidationsUsd: args.shortLiquidationsUsd,
        totalLiquidationsUsd,
        tradeCount: args.tradeCount,
        tsUtc: args.tsUtc,
        windowSeconds: args.windowSeconds,
      });
      return { action: "updated", clusterId: existing._id, totalLiquidationsUsd };
    } else {
      const id = await ctx.db.insert("liquidationClusters", {
        instrumentId: args.instrumentId,
        priceBucket: args.priceBucket,
        bucketSizeUsd: args.bucketSizeUsd,
        longLiquidationsUsd: args.longLiquidationsUsd,
        shortLiquidationsUsd: args.shortLiquidationsUsd,
        totalLiquidationsUsd,
        tradeCount: args.tradeCount,
        tsUtc: args.tsUtc,
        windowSeconds: args.windowSeconds,
      });
      return { action: "created", clusterId: id, totalLiquidationsUsd };
    }
  },
});