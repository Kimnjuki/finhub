// convex/queries/heatmap.ts
// Reactive query for the latest heatmap snapshot

import { v } from "convex/values";
import { query } from "../_generated/server";

export const getLatestHeatmap = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("heatmapSnapshots")
      .order("desc")
      .first();
  },
});

export const getHeatmapHistory = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("heatmapSnapshots")
      .order("desc")
      .take(limit);
  },
});