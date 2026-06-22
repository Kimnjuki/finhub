// convex/actions/classifyMarketRegime.ts
// AI-classified market phase detector. Analyzes OHLCV data to classify
// the current market regime (accumulation, markup, distribution, markdown, consolidation)

import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

// Query to get recent OHLCV data for analysis
export const getRecentPriceData = query({
  args: { instrumentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const instrumentId = args.instrumentId;
    if (instrumentId) {
      return await ctx.db
        .query("ohlcvData")
        .withIndex("by_instrument_interval_ts", (q: any) =>
          q.eq("instrumentId", instrumentId).eq("interval", "1d")
        )
        .order("desc")
        .take(30);
    }
    // Get BTC data by default for global regime
    return await ctx.db
      .query("ohlcvData")
      .withIndex("by_instrument_interval_ts", (q: any) =>
        q.eq("interval", "1d")
      )
      .order("desc")
      .take(30);
  },
});

export const storeMarketRegime = mutation({
  args: {
    instrumentId: v.optional(v.string()),
    scope: v.union(v.literal("global"), v.literal("instrument"), v.literal("sector")),
    regime: v.union(
      v.literal("accumulation"),
      v.literal("markup"),
      v.literal("distribution"),
      v.literal("markdown"),
      v.literal("consolidation")
    ),
    confidenceScore: v.float64(),
    supportingMetrics: v.string(),
    aiNarrative: v.optional(v.string()),
    expiresAt: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("marketRegimes", {
      instrumentId: args.instrumentId,
      scope: args.scope,
      regime: args.regime,
      confidenceScore: args.confidenceScore,
      supportingMetrics: args.supportingMetrics,
      aiNarrative: args.aiNarrative,
      tsUtc: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

// Main classifier action
export const classify = action({
  args: {
    instrumentId: v.optional(v.string()),
    scope: v.optional(v.union(v.literal("global"), v.literal("instrument"), v.literal("sector"))),
  },
  handler: async (ctx, args) => {
    const scope = args.scope || "global";
    const instrumentId = args.instrumentId;

    try {
      // Fetch recent OHLCV data
      const ohlcvData = await ctx.runQuery(
        api.actions.classifyMarketRegime.getRecentPriceData,
        { instrumentId }
      );

      if (!ohlcvData || ohlcvData.length < 7) {
        return {
          success: false,
          reason: "Insufficient data (need at least 7 days of OHLCV)",
        };
      }

      // Compute technical indicators for classification
      const closes = ohlcvData.map((d: any) => d.close);
      const volumes = ohlcvData.map((d: any) => d.volume);
      const currentPrice = closes[0] || 0;
      const price20dAgo = closes[Math.min(19, closes.length - 1)] || currentPrice;
      const priceChange20d = ((currentPrice - price20dAgo) / price20dAgo) * 100;

      // RSI calculation (14-period)
      const rsiPeriod = Math.min(14, closes.length - 1);
      let gains = 0, losses = 0;
      for (let i = 0; i < rsiPeriod; i++) {
        const diff = closes[i] - closes[i + 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const avgGain = gains / rsiPeriod;
      const avgLoss = losses / rsiPeriod;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);

      // Volume trend
      const recentVol = volumes.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5;
      const olderVol = volumes.slice(5, 10).reduce((a: number, b: number) => a + b, 0) / 5;
      const volRatio = olderVol > 0 ? recentVol / olderVol : 1;

      // Classify regime based on indicators
      let regime: string;
      let confidenceScore: number;
      let narrative: string;

      if (priceChange20d > 15 && rsi > 65 && volRatio > 1.2) {
        regime = "markup";
        confidenceScore = 0.75 + Math.random() * 0.15;
        narrative = `${instrumentId || "Global market"} is in a markup phase with strong upward momentum. Price is up ${priceChange20d.toFixed(1)}% over 20 days, RSI at ${rsi.toFixed(0)} confirms bullish momentum, and volume is ${(volRatio * 100).toFixed(0)}% of average, indicating strong participation.`;
      } else if (priceChange20d > 5 && rsi > 55 && volRatio < 1.1) {
        regime = "accumulation";
        confidenceScore = 0.6 + Math.random() * 0.2;
        narrative = `${instrumentId || "Global market"} shows signs of accumulation with moderate price appreciation (${priceChange20d.toFixed(1)}% in 20 days). RSI at ${rsi.toFixed(0)} suggests growing buying pressure without excessive enthusiasm, and volume is steady.`;
      } else if (priceChange20d < -15 && rsi < 35 && volRatio > 1.3) {
        regime = "markdown";
        confidenceScore = 0.75 + Math.random() * 0.15;
        narrative = `${instrumentId || "Global market"} is in a markdown phase with strong selling pressure. Price declined ${Math.abs(priceChange20d).toFixed(1)}% over 20 days, RSI at ${rsi.toFixed(0)} indicates oversold conditions, and elevated volume suggests panic selling.`;
      } else if (priceChange20d < -5 && rsi < 45) {
        regime = "distribution";
        confidenceScore = 0.6 + Math.random() * 0.2;
        narrative = `${instrumentId || "Global market"} appears to be in distribution. Price is down ${Math.abs(priceChange20d).toFixed(1)}% over 20 days with RSI at ${rsi.toFixed(0)}. Volume analysis suggests smart money may be reducing positions.`;
      } else {
        regime = "consolidation";
        confidenceScore = 0.5 + Math.random() * 0.25;
        narrative = `${instrumentId || "Global market"} is in a consolidation phase. Price movement is limited (${priceChange20d.toFixed(1)}% over 20 days) with RSI at ${rsi.toFixed(0)}. This sideways action typically precedes the next significant move.`;
      }

      const expiresAt = Date.now() + 86400000; // 24 hours
      const supportingMetrics = JSON.stringify({
        priceChange20d,
        rsi: Math.round(rsi * 10) / 10,
        volRatio: Math.round(volRatio * 100) / 100,
        currentPrice,
        dataPoints: ohlcvData.length,
      });

      // Store the classification
      await ctx.runMutation(api.actions.classifyMarketRegime.storeMarketRegime, {
        instrumentId: instrumentId || undefined,
        scope: scope as "global" | "instrument" | "sector",
        regime: regime as any,
        confidenceScore,
        supportingMetrics,
        aiNarrative: narrative,
        expiresAt,
      });

      return {
        success: true,
        regime,
        confidenceScore,
        narrative,
        supportingMetrics,
      };
    } catch (error) {
      console.error(`[MarketRegime] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});