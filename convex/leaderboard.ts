import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return ctx.db.query("leaderboardEntries").withIndex("by_period_score").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("leaderboardEntries") },
  handler: async (ctx: any, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("leaderboardEntry not found: " + id);
    return doc;
  },
});

export const getByPeriod = query({
  args: { period: v.union(v.literal("daily"),v.literal("weekly"),v.literal("monthly"),v.literal("all_time")) },
  handler: async (ctx, { period }) => {
    return ctx.db.query("leaderboardEntries").withIndex("by_period_score", (q) => q.eq("period", period)).order("desc").collect();
  },
});

export const getByPeriodAndRank = query({
  args: { period: v.union(v.literal("daily"),v.literal("weekly"),v.literal("monthly"),v.literal("all_time")), minRank: v.number(), maxRank: v.number() },
  handler: async (ctx, { period, minRank, maxRank }) => {
    return ctx.db.query("leaderboardEntries").withIndex("by_period_rank", (q) => q.eq("period", period).gte("rank", minRank).lte("rank", maxRank)).order("asc").collect();
  },
});

export const getByUserAndPeriod = query({
  args: { userId: v.string(), period: v.string() },
  handler: async (ctx, { userId, period }) => {
    return ctx.db.query("leaderboardEntries").withIndex("by_user_period", (q) => q.eq("userId", userId).eq("period", period)).first();
  },
});

export const create = mutation({
  args: { userId: v.string(), period: v.union(v.literal("daily"),v.literal("weekly"),v.literal("monthly"),v.literal("all_time")), score: v.number(), rank: v.optional(v.number()), signalsCount: v.optional(v.number()), winRate: v.optional(v.number()), avgReturn: v.optional(v.number()), totalPnl: v.optional(v.number()), sharpeRatio: v.optional(v.number()), maxDrawdown: v.optional(v.number()), category: v.optional(v.union(v.literal("signals"),v.literal("ideas"),v.literal("paper_trading"))), metadata: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return ctx.db.insert("leaderboardEntries", { ...args, computedAt: Date.now(), updatedAt: Date.now() });
  },
});

export const update = mutation({
  args: { id: v.id("leaderboardEntries"), score: v.optional(v.number()), rank: v.optional(v.number()), signalsCount: v.optional(v.number()), winRate: v.optional(v.number()), avgReturn: v.optional(v.number()), totalPnl: v.optional(v.number()), sharpeRatio: v.optional(v.number()), maxDrawdown: v.optional(v.number()), category: v.optional(v.union(v.literal("signals"),v.literal("ideas"),v.literal("paper_trading"))), metadata: v.optional(v.string()) },
  handler: async (ctx, { id, ...fields }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("leaderboardEntry not found: " + id);
    const patch = Object.fromEntries(Object.entries(fields).filter(([k,v]) => v!==undefined));
    patch.updatedAt = Date.now();
    return ctx.db.patch(id, patch);
  },
});

export const upsert = mutation({
  args: { userId: v.string(), period: v.union(v.literal("daily"),v.literal("weekly"),v.literal("monthly"),v.literal("all_time")), score: v.number(), rank: v.optional(v.number()), signalsCount: v.optional(v.number()), winRate: v.optional(v.number()), avgReturn: v.optional(v.number()), totalPnl: v.optional(v.number()), sharpeRatio: v.optional(v.number()), maxDrawdown: v.optional(v.number()), category: v.optional(v.union(v.literal("signals"),v.literal("ideas"),v.literal("paper_trading"))), metadata: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("leaderboardEntries").withIndex("by_user_period", (q) => q.eq("userId", args.userId).eq("period", args.period)).first();
    if (existing) {
      const patch = { ...args, updatedAt: now };
      Object.keys(patch).forEach(k => { if(patch[k]===undefined) delete patch[k]; });
      return ctx.db.patch(existing._id, patch);
    }
    return ctx.db.insert("leaderboardEntries", { ...args, computedAt: now, updatedAt: now });
  },
});

export const remove = mutation({
  args: { id: v.id("leaderboardEntries") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("leaderboardEntry not found: " + id);
    await ctx.db.delete(id);
  },
});
