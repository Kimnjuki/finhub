// ingestWhaleTrade.ts
// Convex mutation to detect and store large trades (whale trades) during tick ingestion

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const ingestWhaleTrade = mutation({
  args: {
    instrumentId: v.string(),
    sourceId: v.string(),
    side: v.union(v.literal("buy"), v.literal("sell")),
    price: v.float64(),
    quantity: v.float64(),
    tradeId: v.optional(v.string()),
    tsUtc: v.float64(),
    thresholdUsd: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const notionalValue = args.price * args.quantity;
    const threshold = args.thresholdUsd || 100000;

    // Only store if above threshold
    if (notionalValue < threshold) {
      return { isWhale: false, notionalValue, threshold };
    }

    const receivedAt = Date.now();

    const whaleTradeId = await ctx.db.insert("whaleTrades", {
      instrumentId: args.instrumentId,
      sourceId: args.sourceId,
      side: args.side,
      price: args.price,
      quantity: args.quantity,
      notionalValue,
      thresholdUsd: threshold,
      tradeId: args.tradeId,
      tsUtc: args.tsUtc,
      receivedAt,
    });

    return {
      isWhale: true,
      whaleTradeId,
      notionalValue,
      threshold,
      receivedAt,
    };
  },
});