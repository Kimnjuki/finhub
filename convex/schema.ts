import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// Real-Time Market Data Tables
export const marketData = defineTable({
  symbol: v.string(),
  exchange: v.string(),
  priceUsd: v.float64(),
  priceNative: v.float64(),
  volume24h: v.float64(),
  marketCap: v.optional(v.float64()),
  changePercent24h: v.float64(),
  bidPrice: v.optional(v.float64()),
  askPrice: v.optional(v.float64()),
  lastUpdatedUtc: v.float64(),
  sourceTimestamp: v.float64(),
  receivedTimestamp: v.float64(),
  dataQualityScore: v.float64(),
})
.index('by_symbol', ['symbol'])
.index('by_symbol_and_exchange', ['symbol', 'exchange'])
.index('by_last_updated', ['lastUpdatedUtc'])
.index('by_exchange', ['exchange']);

export const aggregatedMarketData = defineTable({
  symbol: v.string(),
  aggregatedPriceUsd: v.float64(),
  priceMethod: v.union(
    v.literal('volume_weighted'),
    v.literal('median'),
    v.literal('mean')
  ),
  sourceCount: v.float64(),
  spreadPercent: v.float64(),
  totalVolume24h: v.float64(),
  dominantExchange: v.string(),
  lastAggregatedUtc: v.float64(),
  confidence: v.float64(),
})
.index('by_symbol', ['symbol'])
.index('by_last_aggregated', ['lastAggregatedUtc']);

export const priceHistory = defineTable({
  symbol: v.string(),
  timestampUtc: v.float64(),
  open: v.float64(),
  high: v.float64(),
  low: v.float64(),
  close: v.float64(),
  volume: v.float64(),
  interval: v.union(
    v.literal('1m'),
    v.literal('5m'),
    v.literal('15m'),
    v.literal('1h'),
    v.literal('4h'),
    v.literal('1d')
  ),
})
.index('by_symbol_and_interval', ['symbol', 'interval'])
.index('by_symbol_interval_time', ['symbol', 'interval', 'timestampUtc']);

// News & Analytics Infrastructure
export const newsArticles = defineTable({
  title: v.string(),
  content: v.string(),
  summary: v.string(),
  sourceId: v.float64(),
  authorName: v.optional(v.string()),
  publishedAtUtc: v.float64(),
  scrapedAtUtc: v.float64(),
  articleUrl: v.string(),
  imageUrl: v.optional(v.string()),
  category: v.union(
    v.literal('crypto'),
    v.literal('forex'),
    v.literal('stocks'),
    v.literal('commodities'),
    v.literal('macro')
  ),
  tags: v.array(v.string()),
  sentiment: v.optional(v.union(
    v.literal('positive'),
    v.literal('neutral'),
    v.literal('negative')
  )),
  sentimentScore: v.optional(v.float64()),
  relatedSymbols: v.array(v.string()),
  isPremium: v.boolean(),
  viewCount: v.float64(),
})
.index('by_category', ['category'])
.index('by_published', ['publishedAtUtc'])
.index('by_source', ['sourceId'])
.index('by_category_and_published', ['category', 'publishedAtUtc']);

export const marketAnalytics = defineTable({
  symbol: v.string(),
  analyticsType: v.union(
    v.literal('technical_indicators'),
    v.literal('on_chain_metrics'),
    v.literal('market_sentiment'),
    v.literal('volatility_index')
  ),
  metrics: v.string(),
  calculatedAtUtc: v.float64(),
  timeframe: v.string(),
  tierRequired: v.union(
    v.literal('Basic'),
    v.literal('Premium'),
    v.literal('VIP')
  ),
})
.index('by_symbol', ['symbol'])
.index('by_symbol_and_type', ['symbol', 'analyticsType'])
.index('by_calculated_at', ['calculatedAtUtc']);

// Enhanced Existing Tables
export const eventSources = defineTable({
  baseUrl: v.optional(v.string()),
  name: v.string(),
  reliability: v.float64(),
  supabaseId: v.float64(),
  sourceType: v.union(
    v.literal('exchange'),
    v.literal('news_outlet'),
    v.literal('blockchain_explorer'),
    v.literal('data_provider')
  ),
  apiEndpoint: v.optional(v.string()),
  apiKey: v.optional(v.string()),
  updateFrequencySeconds: v.float64(),
  lastSuccessfulFetchUtc: v.optional(v.float64()),
  consecutiveFailures: v.float64(),
  isActive: v.boolean(),
  priority: v.float64(),
})
.index('by_name', ['name'])
.index('by_source_type', ['sourceType'])
.index('by_active', ['isActive'])
.index('by_reliability', ['reliability']);

export const users = defineTable({
  createdAt: v.float64(),
  email: v.string(),
  isVerified: v.boolean(),
  passwordHash: v.optional(v.string()),
  signInMethod: v.union(
    v.literal('email'),
    v.literal('google'),
    v.literal('apple'),
    v.literal('facebook')
  ),
  subscriptionTierId: v.optional(v.string()),
  supabaseUserId: v.string(),
  updatedAt: v.float64(),
  displayName: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  timezone: v.optional(v.string()),
  preferredCurrency: v.union(
    v.literal('USD'),
    v.literal('EUR'),
    v.literal('BTC'),
    v.literal('ETH')
  ),
  apiCallsThisMonth: v.float64(),
  lastActiveUtc: v.float64(),
})
.index('by_email', ['email'])
.index('by_supabase_id', ['supabaseUserId'])
.index('by_last_active', ['lastActiveUtc']);

// Watchlists & Alerts
export const watchlists = defineTable({
  userId: v.string(),
  name: v.string(),
  symbols: v.array(v.string()),
  isDefault: v.boolean(),
  createdAtUtc: v.float64(),
  updatedAtUtc: v.float64(),
  sortOrder: v.float64(),
})
.index('by_user', ['userId'])
.index('by_user_and_default', ['userId', 'isDefault']);

export const priceAlerts = defineTable({
  userId: v.string(),
  symbol: v.string(),
  alertType: v.union(
    v.literal('price_above'),
    v.literal('price_below'),
    v.literal('percent_change'),
    v.literal('volume_spike')
  ),
  targetValue: v.float64(),
  currentValue: v.float64(),
  isTriggered: v.boolean(),
  triggeredAtUtc: v.optional(v.float64()),
  createdAtUtc: v.float64(),
  expiresAtUtc: v.optional(v.float64()),
  notificationChannels: v.array(v.string()),
  isActive: v.boolean(),
})
.index('by_user', ['userId'])
.index('by_symbol', ['symbol'])
.index('by_active', ['isActive'])
.index('by_triggered', ['isTriggered']);
