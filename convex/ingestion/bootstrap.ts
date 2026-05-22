import { mutation, query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Get all market instruments from exchanges
export const getInstrumentRegistry = query({
  async handler(ctx) {
    return ctx.db.query("marketInstruments").collect();
  },
});

// Upsert market instruments from exchange info
export const upsertMarketInstruments = mutation({
  async handler(ctx, args) {
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
  async handler(ctx) {
    // TODO: Call Binance REST API to get exchange info
    // For now, return empty array
    return { success: true };
  },
});

// Fetch exchange info from Coinbase REST API
export const fetchCoinbaseInstruments = mutation({
  async handler(ctx) {
    // TODO: Call Coinbase REST API to get products
    return { success: true };
  },
});

// Fetch exchange info from Kraken REST API
export const fetchKrakenInstruments = mutation({
  async handler(ctx) {
    // TODO: Call Kraken REST API to get asset pairs
    return { success: true };
  },
});