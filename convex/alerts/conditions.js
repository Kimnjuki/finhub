import { action } from "convex";
export const evaluatePriceAbove = action({
    async handler(ctx, { alertId, conditionConfig }) {
        const alert = await ctx.db.get(alertId);
        if (!alert)
            return { met: false };
        // Get latest price for the instrument
        const latestTick = await ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", alert.instrumentId))
            .order("desc")
            .take(1)
            .first();
        if (!latestTick)
            return { met: false };
        // Check if price is above threshold
        const threshold = conditionConfig.threshold;
        const currentPrice = latestTick.price;
        const met = currentPrice > threshold;
        return { met };
    },
});
export const evaluatePriceBelow = action({
    async handler(ctx, { alertId, conditionConfig }) {
        const alert = await ctx.db.get(alertId);
        if (!alert)
            return { met: false };
        const latestTick = await ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", alert.instrumentId))
            .order("desc")
            .take(1)
            .first();
        if (!latestTick)
            return { met: false };
        const threshold = conditionConfig.threshold;
        const currentPrice = latestTick.price;
        const met = currentPrice < threshold;
        return { met };
    },
});
export const evaluatePricePctChange = action({
    async handler(ctx, { alertId, conditionConfig }) {
        const alert = await ctx.db.get(alertId);
        if (!alert)
            return { met: false };
        const pct = conditionConfig.pct;
        const window = conditionConfig.window || "1h"; // or maybe a number of minutes
        const direction = conditionConfig.direction || "either"; // "above" or "below" or "either"
        // Get historical price from window ago
        // For simplicity, we'll compare against the price from 1 hour ago
        // In a real implementation, you'd query the ohlcvData for the appropriate interval
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        let startTs = oneHourAgo;
        if (window === "24h")
            startTs = oneDayAgo;
        const historicalTicks = await ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", alert.instrumentId))
            .filter((q) => q.gte("tsUtc", startTs))
            .order("asc")
            .take(1)
            .collect();
        if (historicalTicks.length === 0)
            return { met: false };
        const historicalPrice = historicalTicks[0].price;
        const latestTick = await ctx.db.query("tickData")
            .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", alert.instrumentId))
            .order("desc")
            .take(1)
            .first();
        if (!latestTick)
            return { met: false };
        const currentPrice = latestTick.price;
        const priceChange = ((currentPrice - historicalPrice) / historicalPrice) * 100;
        let met = false;
        if (direction === "above" && priceChange > pct) {
            met = true;
        }
        else if (direction === "below" && priceChange < -pct) {
            met = true;
        }
        else if (direction === "either" && Math.abs(priceChange) > pct) {
            met = true;
        }
        return { met };
    },
});
