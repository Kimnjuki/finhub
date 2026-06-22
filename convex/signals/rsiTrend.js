import * as convex from "convex";
// Signal for RSI trend detection
export const checkRsiTrend = convex.defineAction({
    async handler(ctx, args) {
        const { instrumentId, timeframe = "1h", rsiPeriod = 14 } = args;
        // Fetch recent OHLCV data (last 50 periods to have enough for RSI calculation)
        const ohlcvData = await ctx.db.query("ohlcvData")
            .withIndex("by_instrument_interval", (q) => q.eq("instrumentId", instrumentId).eq("interval", timeframe))
            .take(50)
            .collect();
        if (ohlcvData.length < rsiPeriod + 1) {
            return { trend: "neutral", message: "Insufficient data" };
        }
        // Sort by timestamp ascending for RSI calculation
        ohlcvData.sort((a, b) => a.tsUtc - b.tsUtc);
        // Calculate RSI
        const rsiValues = calculateRSI(ohlcvData, rsiPeriod);
        // Get the last few RSI values for trend analysis
        const currentRSI = rsiValues[rsiValues.length - 1];
        const previousRSI = rsiValues[rsiValues.length - 2];
        const earlierRSI = rsiValues[Math.max(0, rsiValues.length - 3)];
        // Determine trend based on RSI direction and momentum
        const rsiChange = currentRSI - previousRSI;
        const rsiMomentum = rsiChange / previousRSI;
        const rsiAcceleration = previousRSI - earlierRSI;
        let trend = "neutral";
        let strength = 0;
        // Bullish trend: RSI is rising and above 50 (but not overbought)
        if (currentRSI > 50 && rsiChange > 0 && currentRSI < 70) {
            trend = "bullish";
            strength = Math.min(100, Math.round((rsiChange / 10) * 100));
        }
        // Bearish trend: RSI is falling and below 50 (but not oversold)
        else if (currentRSI < 50 && rsiChange < 0 && currentRSI > 30) {
            trend = "bearish";
            strength = Math.min(100, Math.round((-rsiChange / 10) * 100));
        }
        // Strong bullish (RSI moving up from oversold)
        else if (currentRSI > 50 && rsiChange > 0 && earlierRSI < 50) {
            trend = "bullish";
            strength = Math.min(100, Math.round((rsiChange / 10) * 100) + 20);
        }
        // Strong bearish (RSI moving down from overbought)
        else if (currentRSI < 50 && rsiChange < 0 && earlierRSI > 50) {
            trend = "bearish";
            strength = Math.min(100, Math.round((-rsiChange / 10) * 100) + 20);
        }
        return {
            trend,
            rsi: currentRSI,
            momentum: rsiMomentum,
            strength: Math.round(strength),
            message: `RSI trend: ${trend} (current: ${currentRSI.toFixed(2)})`
        };
    },
});
// Helper function to calculate RSI
function calculateRSI(ohlcvData, period) {
    const closes = ohlcvData.map(candle => candle.close);
    const rsiValues = [];
    for (let i = 0; i < closes.length; i++) {
        if (i < period) {
            rsiValues.push(0);
            continue;
        }
        let positiveDifferences = 0;
        let negativeDifferences = 0;
        let totalPositive = 0;
        let totalNegative = 0;
        for (let j = i - period; j < i; j++) {
            const diff = closes[j + 1] - closes[j];
            if (diff > 0) {
                totalPositive += diff;
                positiveDifferences++;
            }
            else if (diff < 0) {
                totalNegative += Math.abs(diff);
                negativeDifferences++;
            }
        }
        const avgGain = totalPositive / period;
        const avgLoss = totalNegative / period;
        let rsi;
        if (avgLoss === 0) {
            rsi = 100;
        }
        else if (avgGain === 0) {
            rsi = 0;
        }
        else {
            const rs = avgGain / avgLoss;
            rsi = 100 - (100 / (1 + rs));
        }
        rsiValues.push(rsi);
    }
    return rsiValues;
}
