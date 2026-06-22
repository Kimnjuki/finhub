import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return ctx.db.query("backtests").withIndex("by_status").order("desc").collect();
    },
});
export const getById = query({
    args: { id: v.id("backtests") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("backtest not found: " + id);
        return doc;
    },
});
export const getByUser = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return ctx.db.query("backtests").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
    },
});
export const getByStatus = query({
    args: { status: v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed")) },
    handler: async (ctx, { status }) => {
        return ctx.db.query("backtests").withIndex("by_status", (q) => q.eq("status", status)).order("desc").collect();
    },
});
export const getByStrategy = query({
    args: { strategyType: v.union(v.literal("momentum"), v.literal("mean_reversion"), v.literal("breakout"), v.literal("grid"), v.literal("custom")) },
    handler: async (ctx, { strategyType }) => {
        return ctx.db.query("backtests").withIndex("by_strategy", (q) => q.eq("strategyType", strategyType)).order("desc").collect();
    },
});
export const create = mutation({
    args: { userId: v.string(), name: v.string(), description: v.optional(v.string()), instrumentIds: v.array(v.string()), strategyType: v.union(v.literal("momentum"), v.literal("mean_reversion"), v.literal("breakout"), v.literal("grid"), v.literal("custom")), strategyConfig: v.string(), signals: v.array(v.string()), timeframe: v.string(), startDate: v.number(), endDate: v.number(), initialCapital: v.number() },
    handler: async (ctx, args) => {
        return ctx.db.insert("backtests", { ...args, status: "pending", isSaved: false, createdAt: Date.now(), updatedAt: Date.now() });
    },
});
export const update = mutation({
    args: { id: v.id("backtests"), name: v.optional(v.string()), description: v.optional(v.string()), instrumentIds: v.optional(v.array(v.string())), strategyType: v.optional(v.union(v.literal("momentum"), v.literal("mean_reversion"), v.literal("breakout"), v.literal("grid"), v.literal("custom"))), strategyConfig: v.optional(v.string()), signals: v.optional(v.array(v.string())), timeframe: v.optional(v.string()), startDate: v.optional(v.number()), endDate: v.optional(v.number()), initialCapital: v.optional(v.number()), finalCapital: v.optional(v.number()), totalReturn: v.optional(v.number()), totalReturnPct: v.optional(v.number()), winRate: v.optional(v.number()), totalTrades: v.optional(v.number()), sharpeRatio: v.optional(v.number()), maxDrawdown: v.optional(v.number()), maxDrawdownPct: v.optional(v.number()), profitFactor: v.optional(v.number()), calmarRatio: v.optional(v.number()), resultsJson: v.optional(v.string()), status: v.optional(v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed"))), errorMsg: v.optional(v.string()), isSaved: v.optional(v.boolean()), completedAt: v.optional(v.number()) },
    handler: async (ctx, { id, ...fields }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("backtest not found: " + id);
        const patch = Object.fromEntries(Object.entries(fields).filter(([k, v]) => v !== undefined));
        patch.updatedAt = Date.now();
        return ctx.db.patch(id, patch);
    },
});
export const remove = mutation({
    args: { id: v.id("backtests") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("backtest not found: " + id);
        await ctx.db.delete(id);
    },
});
