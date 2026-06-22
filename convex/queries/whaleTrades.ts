// convex/queries/whaleTrades.ts
// Reactive queries for the whale trade radar

import { v } from "convex/values";
import { query } from "../_generated/server";

export const getRecent = query({
  args: {
    instrumentId: v.optional(v.string()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    if (args.instrumentId) {
      return await ctx.db
        .query("whaleTrades")
        .withIndex("by_instrument_ts", (q: any) =>
          q.eq("instrumentId", args.instrumentId!)
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("whaleTrades")
      .order("desc")
      .take(limit);
  },
});

export const getByNotional = query({
  args: {
    minNotional: v.optional(v.float64()),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const trades = await ctx.db
      .query("whaleTrades")
      .order("desc")
      .take(100);

    const filtered = args.minNotional
      ? trades.filter((t: any) => t.notionalValue >= args.minNotional!)
      : trades;

    return filtered.slice(0, limit);
  },
});