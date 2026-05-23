import { mutation, query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Get all market instruments from exchanges
export const getInstrumentRegistry = query({
  async handler(ctx: any) {
    return ctx.db.query("marketInstruments").collect();
  },
});

// Upsert market instruments from exchange info
export const upsertMarketInstruments = mutation({
  async handler(ctx: any, args: any) {
    const { instruments } = args;
    const existing = await ctx.db.query("marketInstruments").collect();

    // Delete instruments not in the new list
    for (const instrument of existing) {
      if (!instruments.some((i: any) => i.symbol === instrument.symbol && i.sourceId === instrument.sourceId)) {
        await ctx.db.delete(instrument._id);
      }
    }

    // Insert or update instruments
    for (const instrument of instruments) {
      const id = `${instrument.sourceId}:${instrument.symbol}`;
      await ctx.db.upsert("marketInstruments", id, instrument);
    }

    return { success: true };
  },
});

// Fetch exchange info from Binance REST API and upsert instruments
export const fetchBinanceInstruments = mutation({
  async handler(ctx: any) {
    // TODO: Call Binance REST API to get exchange info
    // For now, return empty array
    return { success: true };
  },
});

// Fetch exchange info from Coinbase REST API
export const fetchCoinbaseInstruments = mutation({
  async handler(ctx: any) {
    // TODO: Call Coinbase REST API to get products
    return { success: true };
  },
});

// Fetch exchange info from Kraken REST API
export const fetchKrakenInstruments = mutation({
  async handler(ctx: any) {
    // TODO: Call Kraken REST API to get asset pairs
    return { success: true };
  },
});

// Ingestion mutations for tick data, OHLCV, etc.
export const ingestTick = mutation({
  async handler(ctx: any, args: any) {
    const { instrumentId, sourceId, price, size, side, tradeId, isMakerOrder, tsUtc, receivedAt } = args;
    await ctx.db.insert("tickData", {
      instrumentId,
      sourceId,
      price,
      size,
      side,
      tradeId,
      isMakerOrder,
      tsUtc,
      receivedAt,
    });
    return { success: true };
  },
});

export const ingestOhlcv = mutation({
  async handler(ctx: any, args: any) {
    const { instrumentId, sourceId, interval, open, high, low, close, volume, quoteVolume, tradeCount, tsUtc, isClosed } = args;
    await ctx.db.insert("ohlcvData", {
      instrumentId,
      sourceId,
      interval,
      open,
      high,
      low,
      close,
      volume,
      quoteVolume,
      tradeCount,
      tsUtc,
      isClosed,
    });
    return { success: true };
  },
});

export const ingestOrderBook = mutation({
  async handler(ctx: any, args: any) {
    const { instrumentId, sourceId, level, bids, asks, sequence, tsUtc, receivedAt } = args;
    await ctx.db.insert("orderBookSnapshots", {
      instrumentId,
      sourceId,
      level,
      bids,
      asks,
      sequence,
      tsUtc,
      receivedAt,
    });
    return { success: true };
  },
});

export const ingestStreamMessage = mutation({
  async handler(ctx: any, args: any) {
    const { sourceId, instrumentId, channel, payload, tsUtc, receivedAt } = args;
    await ctx.db.insert("streamMessages", {
      sourceId,
      instrumentId,
      channel,
      payload,
      tsUtc,
      receivedAt,
    });
    return { success: true };
  },
});
