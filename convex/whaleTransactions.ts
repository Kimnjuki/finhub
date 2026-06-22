import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return ctx.db.query("whaleTransactions").withIndex("by_asset_ts").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("whaleTransactions") },
  handler: async (ctx: any, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("whaleTransaction not found: " + id);
    return doc;
  },
});

export const getByAsset = query({
  args: { assetId: v.string() },
  handler: async (ctx: any, { assetId }) => {
    return ctx.db.query("whaleTransactions").withIndex("by_asset", (q) => q.eq("assetId", assetId)).order("desc").collect();
  },
});

export const getByAssetAndTimeRange = query({
  args: { assetId: v.string(), startTs: v.number(), endTs: v.number() },
  handler: async (ctx, { assetId, startTs, endTs }) => {
    return ctx.db.query("whaleTransactions").withIndex("by_asset_ts", (q) => q.eq("assetId", assetId).gte("tsUtc", startTs).lte("tsUtc", endTs)).order("desc").collect();
  },
});

export const getByTxHash = query({
  args: { txHash: v.string() },
  handler: async (ctx, { txHash }) => {
    return ctx.db.query("whaleTransactions").withIndex("by_tx_hash", (q) => q.eq("txHash", txHash)).first();
  },
});

export const getByTxType = query({
  args: { txType: v.union(v.literal("exchange_inflow"),v.literal("exchange_outflow"),v.literal("whale_to_whale"),v.literal("unknown")) },
  handler: async (ctx, { txType }) => {
    return ctx.db.query("whaleTransactions").withIndex("by_tx_type", (q) => q.eq("txType", txType)).order("desc").collect();
  },
});

export const create = mutation({
  args: { assetId: v.string(), sourceId: v.optional(v.string()), txHash: v.string(), fromAddress: v.string(), toAddress: v.string(), amount: v.number(), amountUsd: v.optional(v.number()), token: v.string(), txType: v.union(v.literal("exchange_inflow"),v.literal("exchange_outflow"),v.literal("whale_to_whale"),v.literal("unknown")), exchangeName: v.optional(v.string()), confidence: v.optional(v.number()), tsUtc: v.number() },
  handler: async (ctx, args) => {
    return ctx.db.insert("whaleTransactions", { ...args, ingestedAt: Date.now() });
  },
});

export const update = mutation({
  args: { id: v.id("whaleTransactions"), sourceId: v.optional(v.string()), amount: v.optional(v.number()), amountUsd: v.optional(v.number()), token: v.optional(v.string()), txType: v.optional(v.union(v.literal("exchange_inflow"),v.literal("exchange_outflow"),v.literal("whale_to_whale"),v.literal("unknown"))), exchangeName: v.optional(v.string()), confidence: v.optional(v.number()) },
  handler: async (ctx, { id, ...fields }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("whaleTransaction not found: " + id);
    return ctx.db.patch(id, Object.fromEntries(Object.entries(fields).filter(([k,v]) => v !== undefined)));
  },
});

export const remove = mutation({
  args: { id: v.id("whaleTransactions") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("whaleTransaction not found: " + id);
    await ctx.db.delete(id);
  },
});
