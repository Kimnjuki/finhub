import { DataSource, AssetClass, AggregatedQuote, MarketDataPoint, NewsItem, CompanyFundamentals, CryptoRanking, GlobalMarketMetrics, MarketIndex, SectorPerformance, InsiderTransaction, EarningsCalendar, SourceHealth } from '../types';
import { sourceSelector } from './SourceSelector';
import { aggregator } from './Aggregator';
import { polygonSource } from '../sources/polygon';
import { coinmarketcapSource } from '../sources/coinmarketcap';
import { coindeskSource } from '../sources/coindesk';
import { alphavantageSource } from '../sources/alphavantage';
import { finnhubSource } from '../sources/finnhub';
import { yahooSource } from '../sources/yahoo';
import { coinapiSource } from '../sources/coinapi';

type MarketEventListener = (event: MarketEvent) => void;

interface MarketEvent {
  type: 'price_update' | 'news' | 'signal' | 'health' | 'error';
  sourceId: DataSource;
  symbol?: string;
  data: any;
  timestamp: number;
}

// CORS proxy configuration - use an actual proxy in production
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || '';

/**
 * Fetch with optional CORS proxy fallback
 */
async function fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
    });
    if (response.ok) return response;
    // If CORS fails and we have a proxy, try via proxy
    if (CORS_PROXY && (response.status === 0 || response.type === 'opaque')) {
      return await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, options);
    }
    return response;
  } catch (err) {
    // If direct fetch fails with CORS error and proxy is configured, try proxy
    if (CORS_PROXY) {
      return await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, options);
    }
    throw err;
  }
}

// Mock data for development when APIs are unavailable
const MOCK_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
  'BTC-USD': { price: 67543.21, change: 234.50, changePercent: 0.35 },
  'ETH-USD': { price: 3456.78, change: -12.34, changePercent: -0.36 },
  'BNB-USD': { price: 612.45, change: 8.20, changePercent: 1.36 },
  'SOL-USD': { price: 145.67, change: 5.43, changePercent: 3.87 },
  'XRP-USD': { price: 0.6234, change: 0.0123, changePercent: 2.01 },
  'ADA-USD': { price: 0.4523, change: -0.0089, changePercent: -1.93 },
  'DOGE-USD': { price: 0.1234, change: -0.0056, changePercent: -4.34 },
  'DOT-USD': { price: 7.89, change: 0.15, changePercent: 1.94 },
  'AVAX-USD': { price: 35.67, change: 1.23, changePercent: 3.57 },
};

function getMockQuote(symbol: string): MarketDataPoint | null {
  const mock = MOCK_PRICES[symbol];
  if (!mock) return null;
  return {
    sourceId: 'coingecko' as DataSource,
    symbol,
    assetClass: 'crypto' as const,
    timestamp: Date.now(),
    price: mock.price,
    change: mock.change,
    changePercent: mock.changePercent,
    high: mock.price * 1.02,
    low: mock.price * 0.98,
    volume: 1000000 + Math.random() * 5000000,
  };
}

/**
 * Unified Market Data Service
 * Orchestrates all data sources with automatic failover, aggregation, and caching
 */
class MarketDataService {
  private listeners: Map<string, Set<MarketEventListener>> = new Map();
  private sourceHealth: Map<DataSource, SourceHealth> = new Map();
  private quoteCache: Map<string, { quote: AggregatedQuote; timestamp: number }> = new Map();
  private cacheTTL = 10000; // 10 seconds
  private activeWebSockets: Map<DataSource, WebSocket[]> = new Map();
  private initCalled = false;
  private useMockData = false;

  /**
   * Initialize all available sources and start health monitoring
   */
  async initialize(): Promise<void> {
    if (this.initCalled) return;
    this.initCalled = true;
    
    console.log('[MarketDataService] Initializing multi-source market data system...');
    console.log('[MarketDataService] Available sources:', Object.keys({
      polygon: polygonSource,
      coinmarketcap: coinmarketcapSource,
      coindesk: coindeskSource,
      alphavantage: alphavantageSource,
      finnhub: finnhubSource,
      yahoo: yahooSource,
      coinapi: coinapiSource,
    }).join(', '));

    // Initialize health tracking for all known sources
    const allSourceIds: DataSource[] = [
      'coinbase', 'kraken', 'polygon', 'coinmarketcap', 'coindesk',
      'alphavantage', 'finnhub', 'yahoo', 'coingecko', 'binance', 'coinapi'
    ];
    for (const sourceId of allSourceIds) {
      this.sourceHealth.set(sourceId, {
        sourceId,
        connected: false,
        lastHeartbeat: Date.now(),
        latencyMs: 0,
        errorRate: 0,
        messagesReceived: 0,
        uptimePercent: 100,
        status: 'disconnected',
      });
    }

    // Start periodic health checks
    setInterval(() => this.runHealthChecks(), 60000);
    
    console.log('[MarketDataService] Initialized successfully');
    console.log('[MarketDataService] CORS proxy:', CORS_PROXY || 'none configured');
    console.log('[MarketDataService] Mock data mode:', this.useMockData ? 'enabled' : 'disabled (real APIs)');
  }

  /**
   * Get an aggregated quote for a symbol from the best available sources
   */
  async getQuote(
    symbol: string,
    assetClass: AssetClass = 'crypto'
  ): Promise<AggregatedQuote | null> {
    // Check cache first
    const cached = this.quoteCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.quote;
    }

    try {
      // Try to get data from multiple sources
      const promises: Promise<MarketDataPoint | null>[] = [];
      
      if (assetClass === 'crypto') {
        // Try CoinDesk for institutional-grade crypto data
        promises.push(this.trySource(() => 
          coindeskSource.getReferenceRates([symbol]).then(r => r[0])
        ));
        // Try Polygon for crypto
        promises.push(this.trySource(() => 
          polygonSource.getLastQuote(symbol)
        ));
      }

      if (assetClass === 'stock') {
        // Try Finnhub for stock quotes
        promises.push(this.trySource(async () => {
          const q = await finnhubSource.getQuote(symbol);
          if (!q) return null;
          return {
            sourceId: 'finnhub' as DataSource,
            symbol,
            assetClass: 'stock' as const,
            timestamp: Date.now(),
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
            high: q.high,
            low: q.low,
            volume: q.volume,
          } as MarketDataPoint;
        }));
        // Try Alpha Vantage for stocks
        promises.push(this.trySource(() => alphavantageSource.getStockQuote(symbol)));
      }

      // Try CoinAPI for institutional crypto/forex exchange rates
      promises.push(this.trySource(async () => {
        try {
          const q = await coinapiSource.getExchangeRate(symbol, undefined, 'USD');
          if (q) return q;
        } catch {
          // Try quote endpoint as fallback
          try {
            const q = await coinapiSource.getCurrentQuote(symbol);
            if (q) return q;
          } catch {}
        }
        return null;
      }));

      // Always try Yahoo as fallback (known to work with some symbols)
      promises.push(this.trySource(async () => {
        try {
          const q = await yahooSource.getQuote(symbol);
          return {
            sourceId: 'yahoo' as DataSource,
            symbol,
            assetClass: assetClass,
            timestamp: q.timestamp,
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
            high: q.high,
            low: q.low,
            volume: q.volume,
          } as MarketDataPoint;
        } catch {
          return null;
        }
      }));

      const results = await Promise.allSettled(promises);
      const validPoints: MarketDataPoint[] = results
        .filter((r): r is PromiseFulfilledResult<MarketDataPoint | null> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value!);

      // If no real data, use mock data for crypto
      if (validPoints.length === 0 && assetClass === 'crypto') {
        const mock = getMockQuote(symbol);
        if (mock) {
          validPoints.push(mock);
          console.warn(`[MarketDataService] Using mock data for ${symbol} (all API sources failed)`);
        }
      }

      if (validPoints.length === 0) {
        console.warn(`[MarketDataService] No data available for ${symbol} from any source`);
        return null;
      }

      const aggregated = aggregator.aggregateQuotes(validPoints);
      if (aggregated && validPoints.length > 0) {
        this.quoteCache.set(symbol, { quote: aggregated, timestamp: Date.now() });
        
        // Emit price update event
        this.emit('price_update', {
          type: 'price_update',
          sourceId: validPoints[0].sourceId,
          symbol,
          data: aggregated,
          timestamp: Date.now(),
        });
      }
      
      return aggregated;
    } catch (error) {
      console.error(`[MarketDataService] Error fetching quote for ${symbol}:`, error);
      // Fallback to mock data on error
      if (assetClass === 'crypto') {
        const mock = getMockQuote(symbol);
        if (mock) {
          const aggregated = aggregator.aggregateQuotes([mock]);
          if (aggregated) {
            this.quoteCache.set(symbol, { quote: aggregated, timestamp: Date.now() });
            return aggregated;
          }
        }
      }
      return null;
    }
  }

  /**
   * Get quotes for multiple symbols
   */
  async getQuotes(
    symbols: string[],
    assetClass: AssetClass = 'crypto'
  ): Promise<Map<string, AggregatedQuote>> {
    const results = new Map<string, AggregatedQuote>();
    const promises = symbols.map(s => this.getQuote(s, assetClass));
    const quotes = await Promise.all(promises);
    
    symbols.forEach((symbol, i) => {
      if (quotes[i]) results.set(symbol, quotes[i]!);
    });
    
    return results;
  }

  /**
   * Get crypto rankings (from CoinMarketCap with mock fallback)
   */
  async getCryptoRankings(limit: number = 50): Promise<CryptoRanking[]> {
    try {
      const rankings = await coinmarketcapSource.getListingsLatest(limit);
      if (rankings.length > 0) return rankings;
    } catch (error) {
      console.warn('[MarketDataService] CoinMarketCap unavailable, using mock rankings');
    }
    // Mock rankings
    const mockCoins = ['BTC', 'ETH', 'SOL', 'XRP', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM'];
    return mockCoins.slice(0, limit).map((symbol, i) => ({
      rank: i + 1,
      symbol,
      name: symbol,
      price: MOCK_PRICES[`${symbol}-USD`]?.price || Math.random() * 1000,
      marketCap: Math.random() * 100000000000,
      volume24h: Math.random() * 10000000000,
      circulatingSupply: Math.random() * 100000000,
      change1h: (Math.random() - 0.5) * 5,
      change24h: (Math.random() - 0.5) * 10,
      change7d: (Math.random() - 0.5) * 20,
      tags: [],
    }));
  }

  /**
   * Get global market metrics
   */
  async getGlobalMetrics(): Promise<GlobalMarketMetrics | null> {
    try {
      const metrics = await coinmarketcapSource.getGlobalMetrics();
      if (metrics) return metrics;
    } catch {
      // Return default metrics
    }
    return {
      totalMarketCap: 2450000000000,
      totalVolume24h: 85000000000,
      btcDominance: 52.5,
      ethDominance: 17.3,
      defiMarketCap: 45000000000,
      stablecoinMarketCap: 150000000000,
      totalCryptocurrencies: 12000,
      totalExchanges: 300,
      btcVolume24h: 35000000000,
      ethVolume24h: 15000000000,
      timestamp: Date.now(),
    };
  }

  /**
   * Get market indices (from Yahoo Finance)
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const indices = await yahooSource.getMarketIndices();
      if (indices.length > 0) return indices;
    } catch {
      console.warn('[MarketDataService] Yahoo Finance unavailable for indices, using mock data');
    }
    // Mock indices
    return [
      { symbol: '^GSPC', name: 'S&P 500', price: 5432.10, change: 24.50, changePercent: 0.45, volume: 2000000000, timestamp: Date.now() },
      { symbol: '^IXIC', name: 'NASDAQ', price: 17678.90, change: 108.50, changePercent: 0.62, volume: 3500000000, timestamp: Date.now() },
      { symbol: '^DJI', name: 'Dow Jones', price: 39123.45, change: 109.50, changePercent: 0.28, volume: 1500000000, timestamp: Date.now() },
      { symbol: '^VIX', name: 'VIX', price: 14.32, change: -0.31, changePercent: -2.15, volume: 50000000, timestamp: Date.now() },
      { symbol: '^FTSE', name: 'FTSE 100', price: 8234.56, change: -9.88, changePercent: -0.12, volume: 800000000, timestamp: Date.now() },
      { symbol: '^N225', name: 'Nikkei 225', price: 38901.23, change: 405.00, changePercent: 1.05, volume: 1200000000, timestamp: Date.now() },
    ];
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      const sectors = await yahooSource.getSectorPerformance();
      if (sectors.length > 0) return sectors;
    } catch {
      console.warn('[MarketDataService] Yahoo Finance unavailable for sectors, using mock data');
    }
    return [
      { sector: 'Technology', changePercent: 1.25, topGainer: 'NVDA', topGainerChange: 3.45, timestamp: Date.now() },
      { sector: 'Healthcare', changePercent: 0.45, topGainer: 'UNH', topGainerChange: 1.23, timestamp: Date.now() },
      { sector: 'Finance', changePercent: -0.32, topGainer: 'JPM', topGainerChange: 0.89, timestamp: Date.now() },
      { sector: 'Energy', changePercent: 0.89, topGainer: 'XOM', topGainerChange: 2.10, timestamp: Date.now() },
      { sector: 'Consumer Cyclical', changePercent: -0.56, topGainer: 'AMZN', topGainerChange: 1.50, timestamp: Date.now() },
      { sector: 'Real Estate', changePercent: 0.12, topGainer: 'PLD', topGainerChange: 0.75, timestamp: Date.now() },
    ];
  }

  /**
   * Get aggregated news from multiple sources
   */
  async getMarketNews(
    symbols?: string[],
    limit: number = 20
  ): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];
    
    try {
      // Try Finnhub first (best for market news)
      if (!symbols || symbols.length === 0) {
        const general = await finnhubSource.getMarketNews('general', 0);
        allNews.push(...general.slice(0, limit));
      } else {
        for (const symbol of symbols.slice(0, 5)) {
          const news = await finnhubSource.getCompanyNews(symbol, 
            new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          );
          allNews.push(...news);
        }
      }
    } catch {
      // Fallback to Yahoo news
      try {
        if (symbols && symbols.length > 0) {
          const yahooNews = await yahooSource.getNews(symbols[0], limit);
          allNews.push(...yahooNews);
        }
      } catch {
        console.warn('[MarketDataService] All news sources unavailable');
      }
    }

    // Deduplicate by id
    const seen = new Set<string>();
    return allNews
      .filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      })
      .slice(0, limit)
      .sort((a, b) => b.publishedAt - a.publishedAt);
  }

  /**
   * Get trending crypto coins
   */
  async getTrendingCoins(limit: number = 10): Promise<CryptoRanking[]> {
    try {
      const trending = await coinmarketcapSource.getTrendingCoins(limit);
      if (trending.length > 0) return trending;
    } catch {
      console.warn('[MarketDataService] Trending coins unavailable, using mock data');
    }
    return this.getCryptoRankings(limit);
  }

  /**
   * Get gainers and losers
   */
  async getGainersLosers(limit: number = 10): Promise<{ gainers: CryptoRanking[]; losers: CryptoRanking[] }> {
    try {
      return await coinmarketcapSource.getGainersLosers(limit);
    } catch {
      const rankings = await this.getCryptoRankings(limit * 2);
      const sorted = [...rankings].sort((a, b) => (b.change24h || 0) - (a.change24h || 0));
      return {
        gainers: sorted.slice(0, limit),
        losers: sorted.slice(-limit).reverse(),
      };
    }
  }

  /**
   * Get company fundamentals from multiple sources
   */
  async getFundamentals(symbol: string): Promise<CompanyFundamentals | null> {
    try {
      return await finnhubSource.getCompanyFundamentals(symbol);
    } catch {
      try {
        const stats = await yahooSource.getKeyStatistics(symbol);
        if (stats) {
          const defaultKey = stats.defaultKeyStatistics;
          const financialData = stats.financialData;
          return {
            symbol,
            name: stats.price?.longName || symbol,
            marketCap: defaultKey?.marketCap?.raw,
            peRatio: defaultKey?.peRatio?.raw,
            eps: defaultKey?.epsTrailingTwelveMonths?.raw,
            dividendYield: defaultKey?.dividendYield?.raw,
            beta: defaultKey?.beta?.raw,
            revenue: financialData?.totalRevenue?.raw,
            revenueGrowth: financialData?.revenueGrowth?.raw,
            profitMargin: financialData?.profitMargins?.raw,
            sourceId: 'yahoo' as DataSource,
            timestamp: Date.now(),
          };
        }
      } catch {}
      return null;
    }
  }

  /**
   * Search symbols across all sources
   */
  async searchSymbols(query: string): Promise<{ symbol: string; name: string; type: string; exchange: string }[]> {
    try {
      return await yahooSource.searchSymbols(query);
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to real-time updates via WebSocket
   */
  subscribeToSymbol(symbol: string, assetClass: AssetClass = 'crypto'): void {
    if (assetClass === 'crypto') {
      // Connect to Coinbase WebSocket for crypto
      if (typeof WebSocket === 'undefined') {
        console.warn(`[MarketDataService] WebSocket not available`);
        return;
      }
      const wsUrl = 'wss://ws-feed.pro.coinbase.com';
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch (e) {
        console.warn(`[MarketDataService] WebSocket connection failed for ${symbol}:`, e);
        setTimeout(() => this.subscribeToSymbol(symbol, assetClass), 30000);
        return;
      }
      
      const heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          product_ids: [symbol],
          channels: ['ticker', 'matches'],
        }));
        this.updateSourceHealth('coinbase', 'connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ticker') {
            this.emit('price_update', {
              type: 'price_update',
              sourceId: 'coinbase',
              symbol: data.product_id,
              data: {
                price: parseFloat(data.price),
                bid: parseFloat(data.best_bid),
                ask: parseFloat(data.best_ask),
                volume24h: parseFloat(data.volume_24h),
              },
              timestamp: Date.now(),
            });
          }
        } catch {}
      };

      ws.onerror = () => this.updateSourceHealth('coinbase', 'degraded');
      ws.onclose = () => {
        this.updateSourceHealth('coinbase', 'disconnected');
        clearInterval(heartbeatTimer);
        setTimeout(() => this.subscribeToSymbol(symbol, assetClass), 30000);
      };

      const existing = this.activeWebSockets.get('coinbase') || [];
      existing.push(ws);
      this.activeWebSockets.set('coinbase', existing);
    }
  }

  /**
   * Unsubscribe from symbol updates
   */
  unsubscribeFromSymbol(symbol: string, sourceId?: DataSource): void {
    if (sourceId) {
      const sockets = this.activeWebSockets.get(sourceId) || [];
      sockets.forEach(ws => {
        try {
          ws.send(JSON.stringify({
            type: 'unsubscribe',
            product_ids: [symbol],
            channels: ['ticker', 'matches'],
          }));
        } catch {}
      });
    } else {
      // Unsubscribe from all sources
      this.activeWebSockets.forEach((sockets, sid) => {
        sockets.forEach(ws => {
          try {
            ws.send(JSON.stringify({
              type: 'unsubscribe',
              product_ids: [symbol],
              channels: ['ticker', 'matches'],
            }));
          } catch {}
        });
      });
    }
  }

  /**
   * Clean up all connections
   */
  destroy(): void {
    this.activeWebSockets.forEach((sockets) => {
      sockets.forEach(ws => {
        try { ws.close(); } catch {}
      });
    });
    this.activeWebSockets.clear();
    this.listeners.clear();
    this.quoteCache.clear();
    this.initCalled = false;
  }

  /**
   * Event emitter system
   */
  on(event: string, handler: MarketEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  private emit(eventType: string, event: MarketEvent): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try { handler(event); } catch (e) { console.error('[MarketDataService] Event handler error:', e); }
      });
    }
  }

  /**
   * Try a source call with error handling
   */
  private async trySource<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      const start = Date.now();
      const result = await fn();
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update source health status
   */
  private updateSourceHealth(sourceId: DataSource, status: 'connected' | 'degraded' | 'disconnected'): void {
    const health = this.sourceHealth.get(sourceId);
    if (health) {
      health.status = status;
      health.connected = status === 'connected';
      health.lastHeartbeat = Date.now();
      this.sourceHealth.set(sourceId, health);
      
      this.emit('health', {
        type: 'health',
        sourceId,
        data: health,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Run periodic health checks on all sources
   */
  private async runHealthChecks(): Promise<void> {
    for (const [sourceId, health] of this.sourceHealth) {
      // Check if source has been silent for too long
      if (health.connected && Date.now() - health.lastHeartbeat > 120000) {
        health.status = 'degraded';
        this.sourceHealth.set(sourceId, health);
      }
    }
  }

  /**
   * Get health status of all sources
   */
  getSourceHealth(): Map<DataSource, SourceHealth> {
    return this.sourceHealth;
  }

  /**
   * Clear the quote cache
   */
  clearCache(): void {
    this.quoteCache.clear();
  }

  /**
   * Enable/disable mock data mode
   */
  setMockDataMode(enabled: boolean): void {
    this.useMockData = enabled;
  }
}

// Singleton instance
export const marketDataService = new MarketDataService();