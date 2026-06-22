// convex/queries/screener.ts
// Multi-asset screener engine — filters instruments by price change, volume, RSI, etc.

import { v } from "convex/values";
import { query } from "../_generated/server";

export const run = query({
  args: {
    filterConfig: v.optional(v.string()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const filters = args.filterConfig ? JSON.parse(args.filterConfig) : {};

    // Get recent price aggregates
    const aggregates = await ctx.db
      .query("priceAggregates")
      .order("desc")
      .take(200);

    // Parse filter criteria
    const priceChangeMin = filters.priceChangePct?.min;
    const priceChangeMax = filters.priceChangePct?.max;
    const minVolume = filters.minVolume;
    const marketCapTier = filters.marketCapTier; // 'large', 'mid', 'small', 'micro'

    // Apply filters
    const results = aggregates.filter((agg: any) => {
      // Price change filter
      if (priceChangeMin != null && (agg.changePercent24h ?? 0) < priceChangeMin) return false;
      if (priceChangeMax != null && (agg.changePercent24h ?? 0) > priceChangeMax) return false;

      // Volume filter
      if (minVolume != null && agg.volume < minVolume) return false;

      return true;
    });

    // Sort by volume descending (most liquid first)
    results.sort((a: any, b: any) => b.volume - a.volume);

    return results.slice(0, limit).map((agg: any) => ({
      instrumentId: agg.instrumentId,
      sourceId: agg.sourceId,
      price: agg.close,
      changePercent24h: agg.changePercent24h,
      changePercent1h: agg.changePercent1h,
      volume24h: agg.volume,
      vwap: agg.vwap,
      tradeCount: agg.tradeCount,
      tsUtc: agg.tsUtc,
    }));
  },
});

export const getPresets = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("screenerFilters")
      .take(50);
  },
});