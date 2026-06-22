import { query } from "convex/server";
// Get latest ticker for an instrument
export const getTicker = query({
    async handler(ctx, { symbol }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        // Get the instrument first
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        // Get latest tick data
        const tick = await ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", instrument._id))
            .order("desc")
            .take(1)
            .first();
        return tick || null;
    },
});
// Get OHLCV data for an instrument
export const getOhlcv = query({
    async handler(ctx, { symbol, interval = "1h", limit = 200 }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("ohlcvData")
            .withIndex("by_instrument_interval_ts", (q) => q.eq("instrumentId", instrument._id).eq("interval", interval))
            .order("desc")
            .take(limit)
            .collect();
    },
});
// Get order book snapshot
export const getOrderBook = query({
    async handler(ctx, { symbol, level = "l2" }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("orderBookSnapshots")
            .filter((q) => q.eq("instrumentId", instrument._id))
            .filter((q) => q.eq("level", level))
            .order("desc")
            .take(1)
            .first();
    },
});
// Get recent trades
export const getTrades = query({
    async handler(ctx, { symbol, limit = 50 }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", instrument._id))
            .order("desc")
            .take(limit)
            .collect();
    },
});
// Get funding rates
export const getFundingRates = query({
    async handler(ctx, { symbol, limit = 10 }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("fundingRates")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", instrument._id))
            .order("desc")
            .take(limit)
            .collect();
    },
});
// Get open interest
export const getOpenInterest = query({
    async handler(ctx, { symbol, limit = 10 }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("openInterest")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", instrument._id))
            .order("desc")
            .take(limit)
            .collect();
    },
});
// Get signals for an instrument
export const getSignals = query({
    async handler(ctx, { symbol, limit = 20 }) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated");
        const access = await checkAccess(ctx, identity.subject, "market_data");
        if (!access.allowed)
            throw new Error(access.reason);
        const instrument = await ctx.db.query("marketInstruments").withIndex("by_symbol", (q) => q.eq("symbol", symbol)).first();
        if (!instrument)
            throw new Error("Instrument not found");
        return ctx.db.query("signals")
            .withIndex("by_instrument", (q) => q.eq("instrumentId", instrument._id))
            .order("desc")
            .take(limit)
            .collect();
    },
});
// Helper function for access control (will be implemented properly later)
async function checkAccess(ctx, userId, feature) {
    // This is a simplified version - in production, this would check user entitlements
    return { allowed: true, reason: "Access denied" };
}
