// cronActions.ts
// Convex actions executed by crons.ts. Each action performs a specific
// data pipeline task (heatmap refresh, price aggregates, etc.)

import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════════
// HEATMAP REFRESH — Every 10 seconds
// ═══════════════════════════════════════════════════════════════════════════
export const heatmapRefreshAction = action({
  handler: async (ctx) => {
    try {
      // Fetch top coins from CoinGecko mock endpoint (or real when API key available)
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&sparkline=false"
      );
      if (!res.ok) {
        console.error(`[Heatmap] CoinGecko fetch failed: ${res.status}`);
        return { success: false, error: `HTTP ${res.status}` };
      }
      const coins: any[] = await res.json();

      const snapshotTs = Date.now();
      const topGainers = coins
        .filter((c: any) => c.price_change_percentage_24h != null)
        .sort((a: any, b: any) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 10)
        .map((c: any) => c.id);
      const topLosers = coins
        .filter((c: any) => c.price_change_percentage_24h != null)
        .sort((a: any, b: any) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 10)
        .map((c: any) => c.id);
      const totalMarketCap = coins.reduce((sum: number, c: any) => sum + (c.market_cap || 0), 0);
      const totalVolume = coins.reduce((sum: number, c: any) => sum + (c.total_volume || 0), 0);
      const btc = coins.find((c: any) => c.id === "bitcoin");
      const btcDominance = btc && totalMarketCap > 0 ? (btc.market_cap / totalMarketCap) * 100 : 0;

      const coinData = coins.map((c: any) => ({
        coinId: c.id,
        symbol: c.symbol,
        priceChangePercent: c.price_change_percentage_24h || 0,
        volume24h: c.total_volume || 0,
        marketCap: c.market_cap || 0,
        sector: "crypto",
      }));

      await ctx.runMutation(api.cronActions.upsertHeatmapSnapshot, {
        snapshotTs,
        intervalSeconds: 10,
        coins: JSON.stringify(coinData),
        topGainers: JSON.stringify(topGainers),
        topLosers: JSON.stringify(topLosers),
        totalMarketCapUsd: totalMarketCap,
        totalVolumeUsd: totalVolume,
        btcDominance,
      });

      return { success: true, coinCount: coins.length };
    } catch (error) {
      console.error(`[Heatmap] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const upsertHeatmapSnapshot = mutation({
  args: {
    snapshotTs: v.float64(),
    intervalSeconds: v.float64(),
    coins: v.string(),
    topGainers: v.string(),
    topLosers: v.string(),
    totalMarketCapUsd: v.float64(),
    totalVolumeUsd: v.float64(),
    btcDominance: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("heatmapSnapshots", {
      snapshotTs: args.snapshotTs,
      intervalSeconds: args.intervalSeconds,
      coins: args.coins,
      topGainers: args.topGainers,
      topLosers: args.topLosers,
      totalMarketCapUsd: args.totalMarketCapUsd,
      totalVolumeUsd: args.totalVolumeUsd,
      btcDominance: args.btcDominance,
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PRICE AGGREGATES — Every 60 seconds
// ═══════════════════════════════════════════════════════════════════════════
export const priceAggregatesAction = action({
  handler: async (ctx) => {
    try {
      // Get all unique instruments from ohlcvData
      const recentOhlcv = await ctx.runQuery(api.cronActions.getRecentOhlcv, {});
      const now = Date.now();
      const oneMin = 60000;
      const fiveMin = 300000;
      const oneHour = 3600000;

      for (const ohlcv of recentOhlcv) {
        const timeDiff = now - ohlcv.tsUtc;
        let changePercent1m: number | undefined;
        let changePercent5m: number | undefined;
        let changePercent1h: number | undefined;

        if (timeDiff <= oneMin + 10000) {
          changePercent1m = 0;
        }
        if (timeDiff <= fiveMin + 10000) {
          changePercent5m = 0;
        }
        if (timeDiff <= oneHour + 10000) {
          changePercent1h = 0;
        }

        await ctx.runMutation(api.cronActions.upsertPriceAggregate, {
          instrumentId: ohlcv.instrumentId,
          sourceId: ohlcv.sourceId,
          open: ohlcv.open,
          high: ohlcv.high,
          low: ohlcv.low,
          close: ohlcv.close,
          volume: ohlcv.volume,
          vwap: ohlcv.quoteVolume && ohlcv.volume ? ohlcv.quoteVolume / ohlcv.volume : undefined,
          tradeCount: ohlcv.tradeCount || 0,
          changePercent1m,
          changePercent5m,
          changePercent1h,
          tsUtc: now,
        });
      }

      return { success: true, updated: recentOhlcv.length };
    } catch (error) {
      console.error(`[PriceAggregates] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const getRecentOhlcv = mutation({
  handler: async (ctx) => {
    const results = await ctx.db
      .query("ohlcvData")
      .withIndex("by_instrument_interval_ts", (q: any) => q.eq("interval", "1m"))
      .order("desc")
      .take(100);
    return results.map((r) => ({
      instrumentId: r.instrumentId,
      sourceId: r.sourceId,
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume,
      quoteVolume: r.quoteVolume,
      tradeCount: r.tradeCount,
      tsUtc: r.tsUtc,
    }));
  },
});

export const upsertPriceAggregate = mutation({
  args: {
    instrumentId: v.string(),
    sourceId: v.string(),
    open: v.float64(),
    high: v.float64(),
    low: v.float64(),
    close: v.float64(),
    volume: v.float64(),
    vwap: v.optional(v.float64()),
    tradeCount: v.float64(),
    changePercent1m: v.optional(v.float64()),
    changePercent5m: v.optional(v.float64()),
    changePercent1h: v.optional(v.float64()),
    tsUtc: v.float64(),
  },
  handler: async (ctx, args) => {
    // Upsert: find existing aggregate for this instrument, or create
    const existing = await ctx.db
      .query("priceAggregates")
      .withIndex("by_instrument_ts", (q: any) =>
        q.eq("instrumentId", args.instrumentId)
      )
      .order("desc")
      .first();

    if (existing && existing.tsUtc > args.tsUtc - 55000) {
      // Update existing within 55s window
      await ctx.db.patch(existing._id, {
        high: Math.max(existing.high, args.high),
        low: Math.min(existing.low, args.low),
        close: args.close,
        volume: existing.volume + args.volume,
        tradeCount: existing.tradeCount + args.tradeCount,
        changePercent1m: args.changePercent1m ?? existing.changePercent1m,
        changePercent5m: args.changePercent5m ?? existing.changePercent5m,
        changePercent1h: args.changePercent1h ?? existing.changePercent1h,
        tsUtc: args.tsUtc,
      });
    } else {
      await ctx.db.insert("priceAggregates", {
        instrumentId: args.instrumentId,
        sourceId: args.sourceId,
        open: args.open,
        high: args.high,
        low: args.low,
        close: args.close,
        volume: args.volume,
        vwap: args.vwap,
        tradeCount: args.tradeCount,
        changePercent1m: args.changePercent1m,
        changePercent5m: args.changePercent5m,
        changePercent1h: args.changePercent1h,
        tsUtc: args.tsUtc,
      });
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// LIQUIDATION CLUSTERS — Every 5 minutes
// ═══════════════════════════════════════════════════════════════════════════
export const liquidationClustersAction = action({
  handler: async (ctx) => {
    try {
      const recentLiquidations = await ctx.runQuery(
        api.cronActions.getRecentLiquidations,
        {}
      );
      const now = Date.now();
      const windowSeconds = 300;
      const bucketSizeUsd = 50;

      // Group by instrument and price bucket
      const groups: Record<string, any> = {};
      for (const liq of recentLiquidations) {
        const bucket = Math.floor(liq.price / bucketSizeUsd) * bucketSizeUsd;
        const key = `${liq.instrumentId}:${bucket}`;
        if (!groups[key]) {
          groups[key] = {
            instrumentId: liq.instrumentId,
            priceBucket: bucket,
            longUsd: 0,
            shortUsd: 0,
            count: 0,
          };
        }
        if (liq.side === "long") {
          groups[key].longUsd += liq.value || liq.quantity * liq.price;
        } else {
          groups[key].shortUsd += liq.value || liq.quantity * liq.price;
        }
        groups[key].count += 1;
      }

      for (const key of Object.keys(groups)) {
        const g = groups[key];
        await ctx.runMutation(api.cronActions.upsertLiquidationCluster, {
          instrumentId: g.instrumentId,
          priceBucket: g.priceBucket,
          bucketSizeUsd,
          longLiquidationsUsd: g.longUsd,
          shortLiquidationsUsd: g.shortUsd,
          totalLiquidationsUsd: g.longUsd + g.shortUsd,
          tradeCount: g.count,
          tsUtc: now,
          windowSeconds,
        });
      }

      return { success: true, clustersUpdated: Object.keys(groups).length };
    } catch (error) {
      console.error(`[LiquidationClusters] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const upsertLiquidationCluster = mutation({
  args: {
    instrumentId: v.string(),
    priceBucket: v.float64(),
    bucketSizeUsd: v.float64(),
    longLiquidationsUsd: v.float64(),
    shortLiquidationsUsd: v.float64(),
    totalLiquidationsUsd: v.float64(),
    tradeCount: v.float64(),
    tsUtc: v.float64(),
    windowSeconds: v.float64(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("liquidationClusters")
      .withIndex("by_instrument_bucket", (q: any) =>
        q.eq("instrumentId", args.instrumentId).eq("priceBucket", args.priceBucket)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        longLiquidationsUsd: existing.longLiquidationsUsd + args.longLiquidationsUsd,
        shortLiquidationsUsd: existing.shortLiquidationsUsd + args.shortLiquidationsUsd,
        totalLiquidationsUsd: existing.totalLiquidationsUsd + args.totalLiquidationsUsd,
        tradeCount: existing.tradeCount + args.tradeCount,
        tsUtc: args.tsUtc,
        windowSeconds: args.windowSeconds,
      });
    } else {
      await ctx.db.insert("liquidationClusters", {
        instrumentId: args.instrumentId,
        priceBucket: args.priceBucket,
        bucketSizeUsd: args.bucketSizeUsd,
        longLiquidationsUsd: args.longLiquidationsUsd,
        shortLiquidationsUsd: args.shortLiquidationsUsd,
        totalLiquidationsUsd: args.totalLiquidationsUsd,
        tradeCount: args.tradeCount,
        tsUtc: args.tsUtc,
        windowSeconds: args.windowSeconds,
      });
    }
  },
});

export const getRecentLiquidations = mutation({
  handler: async (ctx) => {
    const fiveMinAgo = Date.now() - 300000;
    return await ctx.db
      .query("liquidations")
      .withIndex("by_ts", (q: any) => q.gte("tsUtc", fiveMinAgo))
      .take(5000);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// ALERT EVALUATOR — Every 30 seconds
// ═══════════════════════════════════════════════════════════════════════════
export const alertEvaluatorAction = action({
  handler: async (ctx) => {
    try {
      const activeAlerts = await ctx.runQuery(
        api.cronActions.getActiveAlerts,
        {}
      );
      let triggered = 0;

      for (const alert of activeAlerts) {
        try {
          // For each alert, evaluate its condition based on latest price data
          const latestPrice = await ctx.runQuery(
            api.cronActions.getLatestPriceForAlert,
            { instrumentId: alert.instrumentId }
          );

          if (!latestPrice) continue;

          const rules = alert.conditionConfig?.rules || [];
          let allMet = true;

          for (const rule of rules) {
            let ruleMet = false;
            switch (rule.operator) {
              case "gt":
                ruleMet = latestPrice.close > rule.value;
                break;
              case "gte":
                ruleMet = latestPrice.close >= rule.value;
                break;
              case "lt":
                ruleMet = latestPrice.close < rule.value;
                break;
              case "lte":
                ruleMet = latestPrice.close <= rule.value;
                break;
              case "crosses_above":
              case "crosses_below":
                ruleMet = false; // Requires history comparison
                break;
              default:
                ruleMet = false;
            }
            if (!ruleMet) {
              allMet = false;
              break;
            }
          }

          if (allMet) {
            await ctx.runMutation(api.cronActions.triggerAlert, {
              alertId: alert._id,
              userId: alert.userId,
            });
            triggered++;
          }
        } catch (err) {
          console.error(`[AlertEval] Error evaluating alert ${alert._id}: ${err}`);
        }
      }

      return { success: true, evaluated: activeAlerts.length, triggered };
    } catch (error) {
      console.error(`[AlertEval] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const getActiveAlerts = mutation({
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .take(1000);
  },
});

export const getLatestPriceForAlert = mutation({
  args: { instrumentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.instrumentId) return null;
    const agg = await ctx.db
      .query("priceAggregates")
      .withIndex("by_instrument_ts", (q: any) =>
        q.eq("instrumentId", args.instrumentId!)
      )
      .order("desc")
      .first();
    return agg ? { close: agg.close, tsUtc: agg.tsUtc } : null;
  },
});

export const triggerAlert = mutation({
  args: { alertId: v.id("alerts"), userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const alert = await ctx.db.get(args.alertId);
    if (!alert) return { success: false, error: "Alert not found" };

    // Check cooldown
    if (alert.lastTriggeredAt && alert.cooldownSeconds) {
      const cooldownMs = alert.cooldownSeconds * 1000;
      if (now - alert.lastTriggeredAt < cooldownMs) {
        return { success: false, reason: "cooldown" };
      }
    }

    // Update alert
    await ctx.db.patch(args.alertId, {
      lastTriggeredAt: now,
      triggerCount: (alert.triggerCount || 0) + 1,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: `Alert Triggered: ${alert.type}`,
      message: `Alert ${alert._id} fired at ${new Date(now).toISOString()}`,
      notificationType: "in_app",
      referenceType: "alert",
      referenceId: alert._id,
      isRead: false,
      sentAt: now,
    });

    // Create alert delivery
    for (const channel of alert.deliveryChannels) {
      await ctx.db.insert("alertDeliveries", {
        alertId: args.alertId,
        userId: args.userId,
        channel,
        payload: JSON.stringify({ alertId: args.alertId, type: alert.type, triggeredAt: now }),
        status: "sent",
        retryCount: 0,
        maxRetries: 3,
        sentAt: now,
        createdAt: now,
      });
    }

    // Update user stats
    const user = await ctx.db
      .query("users")
      .withIndex("by_supabase_id", (q: any) => q.eq("supabaseUserId", args.userId))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        totalAlertsFired: (user.totalAlertsFired || 0) + 1,
      });
    }

    return { success: true, triggeredAt: now };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO SNAPSHOTS — Daily at midnight UTC
// ═══════════════════════════════════════════════════════════════════════════
export const portfolioSnapshotAction = action({
  handler: async (ctx) => {
    try {
      const portfolios = await ctx.runQuery(
        api.cronActions.getAllPortfolios,
        {}
      );
      let snapshotsCreated = 0;

      for (const portfolio of portfolios) {
        try {
          // Get all holdings for this portfolio
          const holdings = await ctx.runQuery(
            api.cronActions.getPortfolioHoldings,
            { portfolioId: portfolio._id }
          );

          let totalValue = 0;
          let totalCostBasis = 0;
          const allocation: Record<string, number> = {};

          for (const holding of holdings) {
            const price = await ctx.runQuery(
              api.cronActions.getLatestPriceForAlert,
              { instrumentId: holding.instrumentId }
            );
            const currentPrice = price?.close || 0;
            const value = holding.quantity * currentPrice;
            totalValue += value;
            const costBasis = holding.quantity * (holding.averageCostBasis || 0);
            totalCostBasis += costBasis;
            allocation[holding.instrumentId] = value;
          }

          const snapshotDate = new Date().toISOString().split("T")[0];
          await ctx.runMutation(api.cronActions.createPortfolioSnapshot, {
            portfolioId: portfolio._id,
            totalValueUsd: totalValue,
            totalCostBasisUsd: totalCostBasis,
            unrealizedPnlUsd: totalValue - totalCostBasis,
            unrealizedPnlPct: totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0,
            allocationJson: JSON.stringify(allocation),
            snapshotDate,
          });
          snapshotsCreated++;
        } catch (err) {
          console.error(`[PortfolioSnap] Error for portfolio ${portfolio._id}: ${err}`);
        }
      }

      return { success: true, snapshotsCreated };
    } catch (error) {
      console.error(`[PortfolioSnap] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const getAllPortfolios = mutation({
  handler: async (ctx) => {
    return await ctx.db.query("portfolios").collect();
  },
});

export const getPortfolioHoldings = mutation({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioHoldings")
      .withIndex("by_portfolio", (q: any) => q.eq("portfolioId", args.portfolioId))
      .collect();
  },
});

export const createPortfolioSnapshot = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    totalValueUsd: v.float64(),
    totalCostBasisUsd: v.float64(),
    unrealizedPnlUsd: v.float64(),
    unrealizedPnlPct: v.float64(),
    allocationJson: v.string(),
    snapshotDate: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("portfolioSnapshots", {
      portfolioId: args.portfolioId,
      totalValue: args.totalValueUsd,
      totalCostBasis: args.totalCostBasisUsd,
      pnlAbsolute: args.unrealizedPnlUsd,
      pnlPercent: args.unrealizedPnlPct,
      breakdownRef: args.allocationJson,
      tsUtc: Date.now(),
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// CORRELATION MATRIX — Weekly on Sunday
// ═══════════════════════════════════════════════════════════════════════════
export const correlationMatrixAction = action({
  handler: async (ctx) => {
    try {
      // Get top instruments by volume
      const topInstruments = await ctx.runQuery(
        api.cronActions.getTopInstruments,
        {}
      );

      if (topInstruments.length < 2) {
        return { success: false, reason: "Not enough instruments" };
      }

      // Get daily close prices for the last 30d
      const top20 = topInstruments.slice(0, 20);
      let pairsComputed = 0;

      for (let i = 0; i < top20.length; i++) {
        for (let j = i + 1; j < top20.length; j++) {
          const returnsA = await ctx.runQuery(
            api.cronActions.getInstrumentReturns,
            { instrumentId: top20[i].instrumentId }
          );
          const returnsB = await ctx.runQuery(
            api.cronActions.getInstrumentReturns,
            { instrumentId: top20[j].instrumentId }
          );

          if (returnsA.length < 7 || returnsB.length < 7) continue;

          // Compute Pearson correlation
          const n = Math.min(returnsA.length, returnsB.length);
          let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
          for (let k = 0; k < n; k++) {
            sumA += returnsA[k];
            sumB += returnsB[k];
            sumAB += returnsA[k] * returnsB[k];
            sumA2 += returnsA[k] * returnsA[k];
            sumB2 += returnsB[k] * returnsB[k];
          }
          const numerator = n * sumAB - sumA * sumB;
          const denom = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
          const correlation = denom === 0 ? 0 : numerator / denom;

          await ctx.runMutation(api.cronActions.upsertCorrelation, {
            instrumentIdA: top20[i].instrumentId,
            instrumentIdB: top20[j].instrumentId,
            correlation,
            windowDays: 30,
          });
          pairsComputed++;
        }
      }

      return { success: true, pairsComputed };
    } catch (error) {
      console.error(`[CorrelationMatrix] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const getTopInstruments = mutation({
  handler: async (ctx) => {
    const aggregates = await ctx.db
      .query("priceAggregates")
      .order("desc")
      .take(100);
    const seen = new Set<string>();
    const unique: { instrumentId: string; volume: number }[] = [];
    for (const agg of aggregates) {
      if (!seen.has(agg.instrumentId)) {
        seen.add(agg.instrumentId);
        unique.push({ instrumentId: agg.instrumentId, volume: agg.volume });
      }
    }
    return unique.sort((a, b) => b.volume - a.volume).slice(0, 20);
  },
});

export const getInstrumentReturns = mutation({
  args: { instrumentId: v.string() },
  handler: async (ctx, args) => {
    const ohlcv = await ctx.db
      .query("ohlcvData")
      .withIndex("by_instrument_interval_ts", (q: any) =>
        q.eq("instrumentId", args.instrumentId).eq("interval", "1d")
      )
      .order("desc")
      .take(30);
    const returns: number[] = [];
    for (let i = 1; i < ohlcv.length; i++) {
      returns.push((ohlcv[i].close - ohlcv[0].close) / ohlcv[0].close);
    }
    return returns;
  },
});

export const upsertCorrelation = mutation({
  args: {
    instrumentIdA: v.string(),
    instrumentIdB: v.string(),
    correlation: v.float64(),
    windowDays: v.float64(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("correlationMatrix")
      .withIndex("by_pair", (q: any) =>
        q.eq("instrumentIdA", args.instrumentIdA).eq("instrumentIdB", args.instrumentIdB)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        coefficient: args.correlation,
        windowDays: args.windowDays,
        tsUtc: Date.now(),
      });
    } else {
      await ctx.db.insert("correlationMatrix", {
        instrumentIdA: args.instrumentIdA,
        instrumentIdB: args.instrumentIdB,
        coefficient: args.correlation,
        windowDays: args.windowDays,
        tsUtc: Date.now(),
      });
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// STREAM HEALTH MONITOR — Every 30 seconds
// ═══════════════════════════════════════════════════════════════════════════
export const streamHealthMonitorAction = action({
  handler: async (ctx) => {
    try {
      const sources = await ctx.runQuery(
        api.cronActions.getAllStreamSources,
        {}
      );
      const now = Date.now();

      for (const source of sources) {
        const streams = await ctx.runQuery(
          api.cronActions.getStreamsForSource,
          { sourceId: source.sourceId }
        );

        for (const stream of streams) {
          const timeSinceLastMessage = now - (stream.lastMessageAt || 0);
          const newStatus = timeSinceLastMessage < 30000 ? "active" : "stale";

          if (newStatus !== stream.status) {
            await ctx.runMutation(api.cronActions.updateStreamStatus, {
              streamId: stream._id,
              status: newStatus,
              ts: now,
            });
          }
        }
      }

      return { success: true, streamsChecked: sources.length };
    } catch (error) {
      console.error(`[StreamHealth] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const getAllStreamSources = mutation({
  handler: async (ctx) => {
    const streams = await ctx.db.query("marketStreams").take(500);
    const sourceIds = new Set(streams.map((s) => s.sourceId));
    return Array.from(sourceIds).map((sourceId) => ({ sourceId }));
  },
});

export const getStreamsForSource = mutation({
  args: { sourceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketStreams")
      .withIndex("by_source_and_channel", (q: any) =>
        q.eq("sourceId", args.sourceId)
      )
      .collect();
  },
});

export const updateStreamStatus = mutation({
  args: { streamId: v.id("marketStreams"), status: v.string(), ts: v.float64() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      status: args.status as any,
      updatedAt: args.ts,
    });
  },
});