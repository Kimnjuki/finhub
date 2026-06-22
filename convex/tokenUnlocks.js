import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return ctx.db.query("tokenUnlocks").withIndex("by_unlock_date").order("asc").collect();
    },
});
export const getById = query({
    args: { id: v.id("tokenUnlocks") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("tokenUnlock not found: " + id);
        return doc;
    },
});
export const getByAsset = query({
    args: { assetId: v.string() },
    handler: async (ctx, { assetId }) => {
        return ctx.db.query("tokenUnlocks").withIndex("by_asset", (q) => q.eq("assetId", assetId)).order("desc").collect();
    },
});
export const getByAssetAndDateRange = query({
    args: { assetId: v.string(), startDate: v.number(), endDate: v.number() },
    handler: async (ctx, { assetId, startDate, endDate }) => {
        return ctx.db.query("tokenUnlocks").withIndex("by_asset_date", (q) => q.eq("assetId", assetId).gte("unlockDate", startDate).lte("unlockDate", endDate)).order("asc").collect();
    },
});
export const getByDateRange = query({
    args: { startDate: v.number(), endDate: v.number() },
    handler: async (ctx, { startDate, endDate }) => {
        return ctx.db.query("tokenUnlocks").withIndex("by_unlock_date", (q) => q.gte("unlockDate", startDate).lte("unlockDate", endDate)).order("asc").collect();
    },
});
export const create = mutation({
    args: { assetId: v.string(), tokenName: v.string(), tokenSymbol: v.string(), unlockedAmount: v.number(), totalSupply: v.number(), unlockType: v.union(v.literal("cliff"), v.literal("linear"), v.literal("monthly")), source: v.string(), description: v.optional(v.string()), unlockDate: v.number(), isVesting: v.optional(v.boolean()), percentageOfSupply: v.optional(v.number()) },
    handler: async (ctx, args) => {
        return ctx.db.insert("tokenUnlocks", { ...args, ingestedAt: Date.now() });
    },
});
export const update = mutation({
    args: { id: v.id("tokenUnlocks"), unlockedAmount: v.optional(v.number()), totalSupply: v.optional(v.number()), unlockType: v.optional(v.union(v.literal("cliff"), v.literal("linear"), v.literal("monthly"))), source: v.optional(v.string()), description: v.optional(v.string()), unlockDate: v.optional(v.number()), isVesting: v.optional(v.boolean()), percentageOfSupply: v.optional(v.number()) },
    handler: async (ctx, { id, ...fields }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("tokenUnlock not found: " + id);
        return ctx.db.patch(id, Object.fromEntries(Object.entries(fields).filter(([k, v]) => v !== undefined)));
    },
});
export const remove = mutation({
    args: { id: v.id("tokenUnlocks") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("tokenUnlock not found: " + id);
        await ctx.db.delete(id);
    },
});
