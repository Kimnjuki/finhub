import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return ctx.db.query("defiProtocols").withIndex("by_tvl").order("desc").collect();
    },
});
export const getById = query({
    args: { id: v.id("defiProtocols") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("defiProtocol not found: " + id);
        return doc;
    },
});
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        return ctx.db.query("defiProtocols").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
    },
});
export const getByChain = query({
    args: { chain: v.string() },
    handler: async (ctx, { chain }) => {
        return ctx.db.query("defiProtocols").withIndex("by_chain", (q) => q.eq("chain", chain)).order("desc").collect();
    },
});
export const getByCategory = query({
    args: { category: v.union(v.literal("dex"), v.literal("lending"), v.literal("yield"), v.literal("derivatives"), v.literal("liquid_staking"), v.literal("insurance"), v.literal("bridge")) },
    handler: async (ctx, { category }) => {
        return ctx.db.query("defiProtocols").withIndex("by_category", (q) => q.eq("category", category)).order("desc").collect();
    },
});
export const create = mutation({
    args: { name: v.string(), slug: v.string(), chain: v.string(), category: v.union(v.literal("dex"), v.literal("lending"), v.literal("yield"), v.literal("derivatives"), v.literal("liquid_staking"), v.literal("insurance"), v.literal("bridge")), tvl: v.number(), tvlChange24h: v.optional(v.number()), volume24h: v.optional(v.number()), fees24h: v.optional(v.number()), revenue24h: v.optional(v.number()), stakingApy: v.optional(v.number()), totalUsers: v.optional(v.number()), activeUsers24h: v.optional(v.number()), audits: v.optional(v.array(v.object({ auditor: v.string(), date: v.number(), passed: v.boolean(), reportUrl: v.optional(v.string()) }))), isActive: v.boolean(), logoUrl: v.optional(v.string()), website: v.optional(v.string()) },
    handler: async (ctx, args) => {
        return ctx.db.insert("defiProtocols", { ...args, ingestedAt: Date.now(), updatedAt: Date.now() });
    },
});
export const update = mutation({
    args: { id: v.id("defiProtocols"), name: v.optional(v.string()), slug: v.optional(v.string()), chain: v.optional(v.string()), category: v.optional(v.union(v.literal("dex"), v.literal("lending"), v.literal("yield"), v.literal("derivatives"), v.literal("liquid_staking"), v.literal("insurance"), v.literal("bridge"))), tvl: v.optional(v.number()), tvlChange24h: v.optional(v.number()), volume24h: v.optional(v.number()), fees24h: v.optional(v.number()), revenue24h: v.optional(v.number()), stakingApy: v.optional(v.number()), totalUsers: v.optional(v.number()), activeUsers24h: v.optional(v.number()), audits: v.optional(v.array(v.object({ auditor: v.string(), date: v.number(), passed: v.boolean(), reportUrl: v.optional(v.string()) }))), isActive: v.optional(v.boolean()), logoUrl: v.optional(v.string()), website: v.optional(v.string()) },
    handler: async (ctx, { id, ...fields }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("defiProtocol not found: " + id);
        const patch = Object.fromEntries(Object.entries(fields).filter(([k, v]) => v !== undefined));
        patch.updatedAt = Date.now();
        return ctx.db.patch(id, patch);
    },
});
export const remove = mutation({
    args: { id: v.id("defiProtocols") },
    handler: async (ctx, { id }) => {
        const doc = await ctx.db.get(id);
        if (!doc)
            throw new Error("defiProtocol not found: " + id);
        await ctx.db.delete(id);
    },
});
