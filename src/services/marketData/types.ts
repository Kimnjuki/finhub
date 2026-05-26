export type AssetClass = 'crypto' | 'stock' | 'forex' | 'option' | 'commodity' | 'index' | 'bond' | 'etf';
export type DataSource = 'coinbase' | 'kraken' | 'polygon' | 'coinmarketcap' | 'coindesk' | 'alphavantage' | 'finnhub' | 'yahoo' | 'coingecko' | 'binance';
export type DataQuality = 'institutional' | 'exchange' | 'aggregated' | 'reference';
export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface SourceConfig {
  sourceId: DataSource;
  name: string;
  quality: DataQuality;
  assetClasses: AssetClass[];
  rateLimit: number; // requests per minute
  requiresAuth: boolean;
  wsSupported: boolean;
  baseUrl: string;
  apiKey?: string;
  wsUrl?: string;
  features: string[]; // e.g., ['ticker', 'trades', 'orderbook', 'news', 'fundamentals']
}

export const SOURCE_CONFIGS: Record<DataSource, SourceConfig> = {
  coinbase: {
    sourceId: 'coinbase',
    name: 'Coinbase Exchange',
    quality: 'exchange',
    assetClasses: ['crypto'],
    rateLimit: 60,
    requiresAuth: true,
    wsSupported: true,
    baseUrl: 'https://api.coinbase.com',
    wsUrl: 'wss://ws-feed.pro.coinbase.com',
    features: ['ticker', 'trades', 'orderbook_l2', 'orderbook_l3', 'user'],
  },
  kraken: {
    sourceId: 'kraken',
    name: 'Kraken',
    quality: 'exchange',
    assetClasses: ['crypto'],
    rateLimit: 30,
    requiresAuth: true,
    wsSupported: true,
    baseUrl: 'https://api.kraken.com',
    wsUrl: 'wss://ws.kraken.com',
    features: ['ticker', 'trades', 'orderbook', 'ohlcv', 'spread'],
  },
  polygon: {
    sourceId: 'polygon',
    name: 'Polygon.io',
    quality: 'institutional',
    assetClasses: ['crypto', 'stock', 'forex', 'option'],
    rateLimit: 5,
    requiresAuth: true,
    wsSupported: true,
    baseUrl: 'https://api.polygon.io',
    wsUrl: 'wss://delayed.polygon.io',
    features: ['ticker', 'trades', 'quotes', 'bars', 'aggregates', 'reference', 'news', 'options'],
  },
  coinmarketcap: {
    sourceId: 'coinmarketcap',
    name: 'CoinMarketCap',
    quality: 'aggregated',
    assetClasses: ['crypto'],
    rateLimit: 30,
    requiresAuth: true,
    wsSupported: false,
    baseUrl: 'https://pro-api.coinmarketcap.com',
    features: ['rankings', 'metadata', 'quotes', 'global-metrics', 'trending', 'gainers-losers', 'exchange-listings'],
  },
  coindesk: {
    sourceId: 'coindesk',
    name: 'CoinDesk Data',
    quality: 'institutional',
    assetClasses: ['crypto'],
    rateLimit: 60,
    requiresAuth: true,
    wsSupported: false,
    baseUrl: 'https://data-api.coindesk.com',
    features: ['index-prices', 'reference-rates', 'multi-exchange', 'historical', 'volatility'],
  },
  alphavantage: {
    sourceId: 'alphavantage',
    name: 'Alpha Vantage',
    quality: 'reference',
    assetClasses: ['crypto', 'stock', 'forex', 'commodity'],
    rateLimit: 5,
    requiresAuth: true,
    wsSupported: false,
    baseUrl: 'https://www.alphavantage.co/query',
    features: ['quotes', 'forex', 'crypto', 'technical-indicators', 'sector-performance', 'news'],
  },
  finnhub: {
    sourceId: 'finnhub',
    name: 'Finnhub',
    quality: 'reference',
    assetClasses: ['stock', 'crypto', 'forex'],
    rateLimit: 60,
    requiresAuth: true,
    wsSupported: true,
    baseUrl: 'https://finnhub.io/api/v1',
    wsUrl: 'wss://ws.finnhub.io',
    features: ['quotes', 'news', 'sentiment', 'earnings', 'ipos', 'insider-transactions', 'fundamentals', 'social-sentiment', 'recommendations', 'etf-holdings'],
  },
  yahoo: {
    sourceId: 'yahoo',
    name: 'Yahoo Finance',
    quality: 'reference',
    assetClasses: ['stock', 'crypto', 'forex', 'etf', 'index', 'bond', 'commodity'],
    rateLimit: 120,
    requiresAuth: false,
    wsSupported: false,
    baseUrl: 'https://query1.finance.yahoo.com',
    features: ['quotes', 'chart', 'sector-performance', 'key-statistics', 'trending', 'news', 'options', 'recommendations', 'insights'],
  },
  coingecko: {
    sourceId: 'coingecko',
    name: 'CoinGecko',
    quality: 'aggregated',
    assetClasses: ['crypto'],
    rateLimit: 30,
    requiresAuth: false,
    wsSupported: false,
    baseUrl: 'https://api.coingecko.com/api/v3',
    features: ['prices', 'trending', 'global-deFi', 'exchanges', 'nfts', 'categories', 'derivatives'],
  },
  binance: {
    sourceId: 'binance',
    name: 'Binance',
    quality: 'exchange',
    assetClasses: ['crypto'],
    rateLimit: 1200,
    requiresAuth: true,
    wsSupported: true,
    baseUrl: 'https://api.binance.com',
    wsUrl: 'wss://stream.binance.com:9443/ws',
    features: ['ticker', 'trades', 'depth', 'kline', 'user', 'funding-rate', 'open-interest', 'liquidations'],
  },
};

export interface MarketDataPoint {
  sourceId: DataSource;
  symbol: string;
  assetClass: AssetClass;
  timestamp: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  vwap?: number;
  change?: number;
  changePercent?: number;
  bid?: number;
  ask?: number;
  spread?: number;
}

export interface AggregatedQuote {
  symbol: string;
  assetClass: AssetClass;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCap?: number;
  bid?: number;
  ask?: number;
  spread?: number;
  openInterest?: number;
  fundingRate?: number;
  timestamp: number;
  sources: DataSource[];
  sourceCount: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface OrderBookLevel {
  price: number;
  size: number;
  orderCount?: number;
}

export interface OrderBook {
  symbol: string;
  sourceId: DataSource;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  sequence?: number;
  isSnapshot: boolean;
}

export interface Trade {
  id: string;
  symbol: string;
  sourceId: DataSource;
  price: number;
  size: number;
  side: 'buy' | 'sell' | 'unknown';
  timestamp: number;
  exchange?: string;
}

export interface Candle {
  symbol: string;
  sourceId: DataSource;
  interval: TimeInterval;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  vwap?: number;
  trades?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: DataSource;
  sourceName: string;
  publishedAt: number;
  symbols: string[];
  categories: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  sentimentScore?: number;
  imageUrl?: string;
  author?: string;
}

export interface CompanyFundamentals {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  employees?: number;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  sharesOutstanding?: number;
  revenue?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  debtToEquity?: number;
  currentRatio?: number;
  description?: string;
  ipoDate?: string;
  sourceId: DataSource;
  timestamp: number;
}

export interface TechnicalIndicator {
  symbol: string;
  sourceId: DataSource;
  indicator: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral' | 'overbought' | 'oversold';
  timestamp: number;
  interval: TimeInterval;
  parameters?: Record<string, number>;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
  topGainer: string;
  topGainerChange: number;
  timestamp: number;
}

export interface CryptoRanking {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply?: number;
  maxSupply?: number;
  change1h: number;
  change24h: number;
  change7d: number;
  dominance?: number;
  tags: string[];
}

export interface GlobalMarketMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  defiMarketCap: number;
  stablecoinMarketCap: number;
  totalCryptocurrencies: number;
  totalExchanges: number;
  btcVolume24h: number;
  ethVolume24h: number;
  timestamp: number;
}

export interface InsiderTransaction {
  symbol: string;
  company: string;
  insider: string;
  position: string;
  transactionType: 'buy' | 'sell';
  shares: number;
  price: number;
  totalValue: number;
  date: number;
  sourceId: DataSource;
}

export interface EarningsCalendar {
  symbol: string;
  name: string;
  date: number;
  quarter: string;
  estimatedEps: number;
  estimatedRevenue: number;
  actualEps?: number;
  actualRevenue?: number;
  sourceId: DataSource;
}

export interface SourceHealth {
  sourceId: DataSource;
  connected: boolean;
  lastHeartbeat: number;
  latencyMs: number;
  errorRate: number;
  messagesReceived: number;
  uptimePercent: number;
  status: 'connected' | 'degraded' | 'disconnected';
}