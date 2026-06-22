// storeTickData.ts
// Convex mutations for efficient tick data storage from WebSocket feeds

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const storeTickData = mutation({
  args: {
    instrumentId: v.string(),
    price: v.float64(),
    size: v.float64(),
    side: v.union(v.literal("buy"), v.literal("sell"), v.literal("unknown")),
    tsUtc: v.float64(),
    sourceId: v.string(),
    tradeId: v.optional(v.string()),
    latencyMs: v.optional(v.float64()),
    processingMs: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const receivedAt = Date.now();
    
    // Store tick data
    await ctx.db.insert("tickData", {
      instrumentId: args.instrumentId,
      sourceId: args.sourceId,
      price: args.price,
      size: args.size,
      side: args.side,
      tradeId: args.tradeId,
      isMakerOrder: args.side === 'sell',
      tsUtc: args.tsUtc,
      receivedAt: receivedAt,
      latencyMs: args.latencyMs,
      processingMs: args.processingMs,
    });

    return {
      success: true,
      storedAt: receivedAt,
      latencyMs: args.latencyMs,
    };
  },
});

export const storeTradeBatch = mutation({
  args: {
    trades: v.array(v.object({
      instrumentId: v.string(),
      price: v.float64(),
      size: v.float64(),
      side: v.union(v.literal("buy"), v.literal("sell"), v.literal("unknown")),
      tsUtc: v.float64(),
      sourceId: v.string(),
      tradeId: v.optional(v.string()),
      latencyMs: v.optional(v.float64()),
    })),
  },
  handler: async (ctx, args) => {
    const results: { success: boolean; tradeId?: string; error?: string }[] = [];
    
    for (const trade of args.trades) {
      try {
        await ctx.db.insert("tickData", {
          instrumentId: trade.instrumentId,
          sourceId: trade.sourceId,
          price: trade.price,
          size: trade.size,
          side: trade.side,
          tradeId: trade.tradeId,
          isMakerOrder: trade.side === 'sell',
          tsUtc: trade.tsUtc,
          receivedAt: Date.now(),
          latencyMs: trade.latencyMs,
          processingMs: 0,
        });
        results.push({ success: true, tradeId: trade.tradeId });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    }

    return {
      total: args.trades.length,
      successCount: results.filter((r: any) => r.success).length,
      results,
    };
  },
});

export const updateStreamMetrics = mutation({
  args: {
    instrumentId: v.string(),
    sourceId: v.string(),
    latencyMs: v.float64(),
    messagesPerSecond: v.float64(),
    errorRate: v.float64(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update marketStreams
    const stream = await ctx.db
      .query("marketStreams")
      .withIndex("by_instrument_and_source", (q: any) => 
        q.eq("instrumentId", args.instrumentId).eq("sourceId", args.sourceId)
      )
      .first();

    if (stream) {
      await ctx.db.patch(stream._id, {
        lastMessageAt: now,
        lagMs: args.latencyMs,
        errorCount: (stream.errorCount || 0) + (args.errorRate > 0.1 ? 1 : 0),
        updatedAt: now,
      });
    }

    // Update streamHealth
    const existingHealth = await ctx.db
      .query("streamHealth")
      .withIndex("by_instrument_channel", (q: any) => 
        q.eq("instrumentId", args.instrumentId).eq("channel", stream?.channel || 'trades')
      )
      .first();

    if (existingHealth) {
      await ctx.db.patch(existingHealth._id, {
        avgLatencyMs: args.latencyMs,
        messagesPerSecond: args.messagesPerSecond,
        errorRate: args.errorRate,
        healthScore: Math.max(0, 100 - (args.latencyMs / 10) - (args.errorRate * 100)),
        checkedAt: now,
      });
    }

    return { success: true };
  },
});
