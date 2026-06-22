import { defineAction, defineQuery } from "convex/server";
// Get all active signals for an instrument
export const getSignals = defineQuery({
    async handler(ctx, { instrumentId }) {
        return ctx.db.query("signals").withIndex("by_instrument", (q) => q.eq("instrumentId", instrumentId)).collect();
    },
});
// Get recent signals by type
export const getSignalsByType = defineQuery({
    async handler(ctx, { signalType, limit }) {
        const query = ctx.db.query("signals").withIndex("by_type", (q) => q.eq("signalType", signalType));
        if (limit)
            query.take(limit);
        return query.collect();
    },
});
export const evaluateSignals = defineAction({
    async handler(ctx, args) {
        const { instrumentId, price, volume, ohlcvData, liquidations } = args;
        console.log(`Evaluating signals for instrument: ${instrumentId}`);
        const generatedSignals = [];
        // 1. Volume Breakout Signal
        if (ohlcvData && ohlcvData.length > 20) {
            const latestClose = ohlcvData[0].close;
            const previousClose = ohlcvData[1].close;
            const volumeSma = ohlcvData.slice(0, 20).reduce((sum, item) => sum + item.volume, 0) / 20;
            const currentVolume = ohlcvData[0].volume;
            // Breakout if volume > 2x SMA and price up > 2%
            if (currentVolume > volumeSma * 2 && ((latestClose - previousClose) / previousClose) > 0.02) {
                generatedSignals.push({
                    signalType: "volume_breakout",
                    direction: "bullish",
                    strength: Math.min(currentVolume / volumeSma, 10),
                    confidence: 0.8,
                    timeframe: "1h",
                    instrumentId,
                    tsUtc: Date.now(),
                });
            }
        }
        // 2. Liquidation Cascade Warning
        if (liquidations && liquidations.length > 0) {
            const totalValue = liquidations.reduce((sum, liq) => sum + (liq.value || 0), 0);
            const longLiquidations = liquidations.filter(liq => liq.side === "long").reduce((sum, liq) => sum + (liq.value || 0), 0);
            const shortLiquidations = liquidations.filter(liq => liq.side === "short").reduce((sum, liq) => sum + (liq.value || 0), 0);
            // Cascade if > $5M liquidated in 5 minutes
            if (totalValue > 5000000) {
                const side = longLiquidations > shortLiquidations ? "bearish" : "bullish";
                generatedSignals.push({
                    signalType: "liquidation_cascade",
                    direction: side,
                    strength: Math.min(totalValue / 10000000, 10),
                    confidence: 0.7,
                    timeframe: "5m",
                    instrumentId,
                    metadata: JSON.stringify({ totalValue, longLiquidations, shortLiquidations }),
                    tsUtc: Date.now(),
                });
            }
        }
        // 3. Funding Rate Arbitrage Signal (simplified - would need multi-exchange data)
        // This would compare perpetual vs spot funding rates
        // 4. OI vs Price Divergence
        if (ohlcvData && ohlcvData.length >= 10) {
            const prices = ohlcvData.slice(0, 10).map(item => item.close);
            const priceChange = (prices[0] - prices[9]) / prices[9];
            // In a real implementation, we'd query openInterest data
            // For now, simplified logic
            if (priceChange > 0.05) {
                generatedSignals.push({
                    signalType: "oi_divergence",
                    direction: "bullish",
                    strength: 5,
                    confidence: 0.6,
                    timeframe: "1h",
                    instrumentId,
                    tsUtc: Date.now(),
                });
            }
        }
        // 5. Cross-Exchange Spread Arbitrage
        // Would compare bid/ask across multiple sources
        // Store generated signals
        if (generatedSignals.length > 0) {
            for (const signal of generatedSignals) {
                await ctx.db.insert("signals", signal);
            }
            console.log(`Generated ${generatedSignals.length} signals for ${instrumentId}`);
        }
        return { generated: generatedSignals };
    },
});
// Background cron to run signal evaluation periodically
export const runSignalEvaluationCron = defineAction({
    async handler(ctx) {
        console.log("Running signal evaluation cron...");
        // Get all active instruments
        const instruments = await ctx.db.query("marketInstruments").filter((q) => q.eq("active", true)).collect();
        for (const instrument of instruments) {
            try {
                // Get latest market data
                const ohlcvData = await ctx.db.query("ohlcvData")
                    .withIndex("by_instrument_interval_ts", (q) => q.eq("instrumentId", instrument._id).eq("interval", "1h"))
                    .order("desc")
                    .take(50)
                    .collect();
                const liquidations = await ctx.db.query("liquidations")
                    .withIndex("by_instrument_ts", (q) => q.eq("instrumentId", instrument._id))
                    .order("desc")
                    .take(20)
                    .collect();
                // Evaluate signals
                await ctx.run.internal(evaluateSignals, {
                    instrumentId: instrument._id,
                    ohlcvData,
                    liquidations,
                });
            }
            catch (error) {
                console.error(`Error evaluating signals for ${instrument.symbol}:`, error);
            }
        }
        return { success: true, processed: instruments.length };
    },
});
