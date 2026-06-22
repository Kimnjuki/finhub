# FinHub v2.0 — World-Class Real-Time Financial & Crypto Platform
## Complete Implementation Guide

**Generated:** 2026-06-22  
**Target Stack:** Convex, TypeScript, React/Next.js, WebSocket providers  
**Version:** 2.0.0

---

## Table of Contents

1. [Competitive Edge](#1-competitive-edge)
2. [Data Provider Strategy](#2-data-provider-strategy)
3. [Features to Build (Priority Order)](#3-features-to-build)
4. [Schema Changes Completed](#4-schema-changes-completed)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Convex Function Patterns](#6-convex-function-patterns)
7. [Frontend Component Map](#7-frontend-component-map)
8. [Monetization Tiers](#8-monetization-tiers)
9. [Cost Estimates & Budget](#9-cost-estimates--budget)
10. [Environment Variables](#10-environment-variables)

---

## 1. Competitive Edge

| Against | Your Advantage |
|---------|---------------|
| **TradingView** | On-chain data, AI narrative explanations, free |
| **CoinGlass** | Multi-asset, macro events, learning layer |
| **Glassnode** | Free real-time price feeds, alerts, retail-friendly |
| **Finviz** | Real-time data, crypto, AI, mobile app |
| **Messari** | Real-time feeds, affordable, developer-friendly |

**Key differentiators:**
- Unified crypto + macro event calendar in one reactive UI
- AI-generated signal narratives (explain WHY a signal fired)
- Liquidation heatmap overlaid on price chart
- Free real-time tier via exchange websockets (Binance, Bybit, OKX)
- Contextual micro-learning cards on every event/signal
- Mobile-first with push alerts
- Whale trade radar with on-chain + CEX cross-referencing

---

## 2. Data Provider Strategy

### Free Tier (Immediately Available)

| Provider | Use For | WebSocket URL | Limits |
|----------|---------|--------------|-------|
| **Binance** | Ticks, orderbook, klines, funding, liquidations | `wss://stream.binance.com:9443/ws` | Free |
| **Bybit** | Perpetuals, OI | `wss://stream.bybit.com/v5/public/linear` | Free |
| **CoinGecko** | Market caps, metadata, trending | REST | 30 req/min |
| **Finnhub** | News, economic calendar, forex | REST | 60 req/min |
| **Alpha Vantage** | Technical indicators, FX, crypto | REST | 25 req/day |

### Paid (When Ready)

| Provider | Plan | Cost | Use For |
|----------|------|------|---------|
| CoinMarketCap | Basic | $29/mo | Discovery, screener |
| Polygon.io | Starter | $29/mo | US stock ticks |
| Twelve Data | Basic | $8/mo | Indicator API |
| Glassnode | Studio | $29/mo | On-chain metrics |

### Cost Optimization Tactics
- Cache REST responses: price 5s, fundamentals 60s, news 30s
- Binance/Bybit websockets = zero cost high-frequency data
- Batch CoinGecko: single `/coins/markets` covers 250 coins
- Store raw ticks 7 days only; persist aggregated OHLCV long-term
- Convex scheduled functions for expensive aggregations

---

## 3. Features to Build

### Priority 1 — Must Have (Week 1-6)

| # | Feature | Description | Data Source | Table |
|---|---------|-------------|-------------|-------|
| 1 | **Real-Time Heatmap** | Top 100+ coins, % change, volume, MC | CoinGecko + Binance WS | `heatmapSnapshots` |
| 2 | **Multi-Asset Screener** | Filter by price, volume, RSI, funding | CoinGecko + Binance + AV | `screenerFilters`, `screenerResults` |
| 3 | **Liquidation Heatmap** | Price-level liquidation clusters | Binance WS | `liquidationClusters` |
| 4 | **AI Signal Narratives** | AI-written 2-sentence explanations | Anthropic API | Extend `signals` table |
| 5 | **Macro + Crypto Calendar** | Fed, CPI, token unlocks, earnings | Finnhub + manual | Extend `events` table |
| 6 | **Whale Trade Radar** | Trades > $100K in real-time | Binance aggTrades WS | `whaleTrades` |
| 7 | **Funding Rate Arb Monitor** | Cross-exchange funding comparison | Binance + Bybit + OKX | Extend `fundingRates` |
| 8 | **Smart Alert Builder** | No-code visual alert creator | Existing alerts | `alertTemplates` |

### Priority 2 — High Value (Week 7-8)

| Feature | Description | Data Source | Table |
|---------|-------------|-------------|-------|
| On-Chain Dashboard | MVRV, SOPR, HODL Waves | Glassnode | Extend `onchainMetrics` |
| Social Sentiment | Twitter volume, Reddit, Fear & Greed | Santiment, LunarCrush | `socialSentiment` |
| Portfolio Tracker | PnL, allocation, risk exposure | User input + price feed | `portfolioHoldings`, `portfolioSnapshots` |
| Paper Trading | Simulated trading with virtual PnL | Signals + price feed | `paperTrades`, `paperPortfolios` |
| TradingView Charts | Embed free charting library | Existing OHLCV data | No schema change needed |
| Learning Cards | Contextual micro-learning | Static content | `learningCards`, `learningCardProgress` |
| Market Regime Detector | AI-classified market phase | OHLCV + on-chain + funding | `marketRegimes` |

### Priority 3 — Differentiators (Week 9-10)

| Feature | Description | Data Source | Table |
|---------|-------------|-------------|-------|
| Correlation Matrix | Live correlation top 20 assets | OHLCV data | `correlationMatrix` (already exists) |
| DeFi Monitor | DEX volumes, TVL by chain | DeFiLlama API | `defiProtocols` |
| Token Unlock Calendar | Upcoming large unlocks | TokenUnlocks.app | Extend `events` |
| Exchange Health Monitor | WS latency, uptime, error rate | Exchange metrics | `marketStreams` (already exists) |

---

## 4. Schema Changes Completed

### New Tables Added (15+)

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `whaleTrades` | Real-time large trade radar | `by_instrument`, `by_ts`, `by_instrument_ts` |
| `liquidationClusters` | Pre-aggregated heatmap buckets | `by_instrument`, `by_instrument_bucket`, `by_ts` |
| `heatmapSnapshots` | Pre-computed coin heatmap (10s cron) | `by_ts` |
| `screenerFilters` | User-saved filter presets | `by_user` |
| `screenerResults` | Cached screener output | `by_filter_hash`, `by_computed_at` |
| `socialSentiment` | Social metrics per asset | `by_asset`, `by_asset_source`, `by_ts` |
| `portfolioHoldings` | User portfolio positions | `by_user`, `by_portfolio`, `by_user_instrument` |
| `paperTrades` | Simulated trades | `by_user`, `by_portfolio`, `by_signal` |
| `paperPortfolios` | Paper trading containers | `by_user` |
| `marketRegimes` | AI-classified market phases | `by_instrument`, `by_scope`, `by_ts` |
| `defiProtocols` | DeFi protocol TVL data | `by_chain`, `by_category`, `by_tvl` |
| `learningCards` | Contextual micro-learning content | `by_category`, `by_difficulty` |
| `learningCardProgress` | Track card completion | `by_user`, `by_user_card` |
| `alertTemplates` | Pre-built alert conditions | `by_alert_type`, `by_usage` |
| `priceAggregates` | Pre-computed price stats | `by_instrument`, `by_instrument_ts` |

### Existing Table Field Additions

| Table | Fields Added |
|-------|-------------|
| `users` | `referralCode`, `referredBy`, `kycStatus`, `totalAlertsFired`, `streakDays` |
| `userPreferences` | `defaultCurrency`, `defaultView`, `whaleTradingThresholdUsd`, `preferredExchanges`, `hideSmallCaps`, `enableLearningCards`, `alertSoundEnabled`, `dashboardWidgets` |
| `fundingRates` | `annualizedRate`, `percentile7d` |
| `onchainMetrics` | Extended metricName enum with `mvrv_zscore`, `hodl_waves`, `stablecoin_supply_ratio`, `exchange_reserve`, `realized_cap`, `puell_multiple`, `net_unrealized_pnl` |
| `events` | Extended category enum + `expectedVolatility`, `affectedAssets`, `relatedSignalIds` |
| `newsFeed` | `relatedCoins`, `impactScore`, `entityMentions` |
| `signals` | `narrativeText`, `triggerSummary`, `backtestWinRate`, `riskRewardRatio`, `volumeConfirmation` |
| `aiOutputs` | `featureId` |
| `alerts` | `templateId`, `backtestResultId`, `notificationsSent` |

### New Indexes Added

| Table | Index |
|-------|-------|
| `users` | `.index('by_referral_code', ['referralCode'])` |
| `newsFeed` | `.index('by_coin', ['coins'])` |
| `signals` | `.index('by_instrument_ts', ['instrumentId', 'tsUtc'])` |
| `aiOutputs` | `.index('by_feature_instrument', ['featureId', 'instrumentId'])` |

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal:** Core real-time data pipeline + basic heatmap live

1. **WebSocket Ingestion Service**
   - Node.js service → Binance streams: aggTrades, miniTicker, forceOrder, fundingRate
   - Normalize and write to Convex via HTTP action
   - Files: `convex/ingestion/binanceWsClient.ts`, `convex/ingestion/normalizer.ts`
   - Mutations: `ingestTick`, `ingestFundingRate`, `ingestLiquidation`, `ingestWhaleTrade`

2. **Heatmap Cron Job**
   - Convex scheduled function every 10s
   - Calls CoinGecko `/coins/markets` for top 200 coins
   - Writes to `heatmapSnapshots`
   - Files: `convex/crons/heatmapRefresh.ts`

3. **Heatmap Reactive Query**
   - Convex query returning latest snapshot
   - Frontend subscribes with `useQuery(api.heatmap.getLatestHeatmap)`
   - Component: `components/HeatmapGrid.tsx`

4. **priceAggregates Cron Job**
   - Runs every 60s
   - Computes 1m/5m/1h/24h change % from ohlcvData
   - File: `convex/crons/priceAggregates.ts`

### Phase 2: Signals & AI (Week 3-4)
**Goal:** AI signal narratives + whale radar live

1. **AI Narrative Generator**
   - Convex action on signal creation → Anthropic API
   - Files: `convex/actions/generateSignalNarrative.ts`

2. **Whale Trade Filter**
   - During tick ingestion, check notionalValue > threshold
   - Threshold: $100K free, $50K premium
   - Component: `components/WhaleRadar.tsx`

3. **Liquidation Cluster Aggregator**
   - Cron every 5 min → groups liquidations by price bucket
   - File: `convex/crons/liquidationClusters.ts`

4. **Market Regime Classifier**
   - AI action: last 30d OHLCV, RSI, funding rate, whale flows
   - File: `convex/actions/classifyMarketRegime.ts`

### Phase 3: Screener & Alerts (Week 5-6)
**Goal:** Advanced screener + smart alert builder

1. **Screener Engine**
   - Convex query accepting filterConfig JSON
   - Component: `components/Screener.tsx`

2. **Alert Templates Library**
   - Pre-populate 20 templates: funding above 0.1%, volume spike 3x, etc.
   - File: `convex/seeds/alertTemplates.ts`

3. **Alert Notification Pipeline**
   - Cron every 30s → evaluates all active alerts → triggers deliveries
   - Supports push, email, webhook channels
   - Files: `convex/crons/alertEvaluator.ts`, `convex/actions/deliverAlert.ts`

### Phase 4: Portfolio & Social (Week 7-8)
**Goal:** Portfolio tracker + social + learning cards

1. **Portfolio PnL Engine**
   - Mutation to add holdings, reactive query for real-time PnL
   - Component: `components/PortfolioDashboard.tsx`

2. **Paper Trading Engine**
   - Mutations: openPaperTrade, closePaperTrade
   - 1-click 'paper trade this signal' button

3. **Learning Cards System**
   - Seed 50 cards, React hook for context triggers
   - Component: `components/LearningCardOverlay.tsx`

4. **Social Watchlists**
   - Public watchlists, follow feature, trending page

### Phase 5: DeFi & On-Chain (Week 9-10)
**Goal:** DeFi monitor + on-chain metrics dashboard

1. **DeFiLlama Integration**
   - Convex action → DeFiLlama /protocols API (free)
   - Cron every 5 min → writes to defiProtocols
   - API: `https://api.llama.fi/protocols`

2. **On-Chain Metrics Ingestion**
   - Glassnode free tier + Alternative.me Fear & Greed
   - Free APIs: `https://api.alternative.me/fng/`

3. **Correlation Matrix Cron**
   - Weekly → top 20 instruments, 30d Pearson correlation
   - File: `convex/crons/correlationMatrix.ts`

---

## 6. Convex Function Patterns

### Reactive Query Example
```typescript
// convex/queries/heatmap.ts
import { query } from './_generated/server';
export const getLatestHeatmap = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('heatmapSnapshots')
      .order('desc')
      .first();
  }
});
// Frontend: const heatmap = useQuery(api.heatmap.getLatestHeatmap);
```

### Action with External API
```typescript
// convex/actions/fetchCoinGeckoHeatmap.ts
import { action } from './_generated/server';
import { api } from './_generated/api';
export const fetchAndStore = action({
  handler: async (ctx) => {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200'
    );
    const coins = await res.json();
    await ctx.runMutation(api.mutations.upsertHeatmapSnapshot, { coins });
  }
});
```

### Scheduled Cron Pattern
```typescript
// convex/crons.ts
import { cronJobs } from 'convex/server';
import { api } from './_generated/api';
const crons = cronJobs();
crons.interval('heatmap refresh', { seconds: 10 }, api.actions.fetchCoinGeckoHeatmap.fetchAndStore);
crons.interval('price aggregates', { seconds: 60 }, api.crons.priceAggregates.compute);
crons.interval('alert evaluator', { seconds: 30 }, api.crons.alertEvaluator.run);
crons.daily('portfolio snapshots', { hourUTC: 0, minuteUTC: 5 }, api.crons.portfolioSnapshot.run);
crons.weekly('correlation matrix', { dayOfWeek: 'sunday', hourUTC: 1, minuteUTC: 0 }, api.crons.correlationMatrix.compute);
export default crons;
```

### AI Narrative Pattern
```typescript
// convex/actions/generateSignalNarrative.ts
import { action } from './_generated/server';
import { api } from './_generated/api';
import { v } from 'convex/values';
export const generate = action({
  args: { signalId: v.string() },
  handler: async (ctx, { signalId }) => {
    const signal = await ctx.runQuery(api.queries.getSignal, { signalId });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Signal: ${signal.signalType} ${signal.direction} on ${signal.instrumentId} at ${signal.entryPrice}, confidence ${signal.confidence}%. Write 2 sentences: what triggered it and what it historically implies.`
        }]
      })
    });
    const data = await response.json();
    const narrative = data.content[0].text;
    await ctx.runMutation(api.mutations.updateSignalNarrative, { signalId, narrative });
  }
});
```

---

## 7. Frontend Component Map

| Widget ID | Component | Convex Query | Update |
|-----------|-----------|-------------|--------|
| `live_heatmap` | `HeatmapGrid` | `queries/heatmap.getLatestHeatmap` | 10s cron |
| `whale_radar` | `WhaleRadar` | `queries/whaleTrades.getRecent` | real-time WS |
| `signal_feed` | `SignalFeed` | `queries/signals.getLatest` | real-time |
| `funding_rates` | `FundingRateTable` | `queries/fundingRates.getCrossExchange` | on change |
| `liquidation_clusters` | `LiquidationHeatmap` | `queries/liquidationClusters.getForInstrument` | 5 min |
| `macro_calendar` | `EventCalendar` | `queries/events.getUpcoming` | hourly |
| `market_regime` | `RegimeBadge` | `queries/marketRegimes.getCurrent` | daily |
| `defi_tvl` | `DefiTvlChart` | `queries/defiProtocols.getTop` | 5 min |
| `social_sentiment` | `SentimentGauge` | `queries/socialSentiment.getLatest` | hourly |
| `screener` | `Screener` | `queries/screener.run` | on filter change |

**Layout System:** User-configurable drag-and-drop dashboard. Widget IDs saved to `userPreferences.dashboardWidgets`.

---

## 8. Monetization Tiers

| Feature | Free | Basic ($9/mo) | Premium ($29/mo) | Enterprise ($99/mo) |
|---------|------|--------------|------------------|---------------------|
| Heatmap | Top 50 | Top 200 | Full | Full |
| Screener | 3 filters | Full | Full | Full |
| Whale Radar | — | >$500K | >$100K | All |
| Liquidation Heatmap | — | — | ✓ | ✓ |
| AI Narratives | — | — | ✓ | ✓ |
| Market Regime | — | — | ✓ | ✓ |
| On-Chain Metrics | — | — | ✓ | ✓ |
| Portfolio Tracker | — | — | ✓ | ✓ |
| Alerts | 5 | 20 + push | Unlimited | Unlimited |
| API Access | — | — | 1,000 req/day | Unlimited |
| Data Latency | 10s | 1s | real-time | real-time |

---

## 9. Cost Estimates & Budget

### At Launch: ~$55-75/month
| Service | Cost |
|---------|------|
| Convex Backend (Starter) | $25 |
| Binance/Bybit/OKX WS | $0 |
| CoinGecko API | $0 |
| Finnhub API | $0 |
| Alpha Vantage | $0 |
| Anthropic API (AI narratives) | $10-30 |
| Hosting (Vercel/Cloudflare) | $20 |

### At 1,000 Premium Users: ~$387/month
| Service | Cost |
|---------|------|
| Convex Backend (Professional) | $100 |
| CoinMarketCap API | $29 |
| Polygon.io | $29 |
| Glassnode | $29 |
| Anthropic API | $150 |
| Hosting | $50 |
| **Revenue at 1k users × $29** | **$29,000/month** |
| **Gross Margin** | **98.7%** |

---

## 10. Environment Variables Needed

```
ANTHROPIC_API_KEY=sk-ant-...
COINGECKO_API_KEY= (optional)
FINNHUB_API_KEY=
GLASSNODE_API_KEY= (phase 5)
POLYGON_API_KEY= (phase 3+)
```

---

## Critical Notes

1. **All cron jobs must be idempotent** — use upsert, never insert blindly
2. **Cache external API responses** for at least 24h in case of provider outage
3. **Whale trade detection** happens in ingestion mutation, not in a cron — latency matters
4. **AI narrative generation is async** — signals are useful immediately, narrative arrives ~2s later
5. **priceAggregates** is the single source of truth for all UI price displays — never query tickData or ohlcvData directly from UI
6. **Rate limit all API routes** via `rateLimits` table
7. **Test priority:** heatmap cron → alert evaluator → AI narrative → websocket reconnection