import { DataSource, AssetClass, AggregatedQuote, MarketDataPoint, NewsItem, CompanyFundamentals, CryptoRanking, GlobalMarketMetrics, MarketIndex, SectorPerformance, InsiderTransaction, EarningsCalendar, SourceHealth } from '../types';
import { sourceSelector } from './SourceSelector';
import { aggregator } from './Aggregator';
import { polygonSource } from '../sources/polygon';
import { coinmarketcapSource } from '../sources/coinmarketcap';
import { coindeskSource } from '../sources/coindesk';
import { alphavantageSource } from '../sources/alphavantage';
import { finnhubSource } from '../sources/finnhub';
import { yahooSource } from '../sources/yahoo';

type MarketEventListener = (event: MarketEvent) => void;

interface MarketEvent {
  type: 'price_update' | 'news' | 'signal' | 'health' | 'error';
  sourceId: DataSource;
  symbol?: string;
  data: any;
  timestamp: number;
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
    }).join(', '));

    // Initialize health tracking for all known sources
    const allSourceIds: DataSource[] = [
      'coinbase', 'kraken', 'polygon', 'coinmarketcap', 'coindesk',
      'alphavantage', 'finnhub', 'yahoo', 'coingecko', 'binance'
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

      // Always try Yahoo as fallback
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

      if (validPoints.length === 0) {
        console.warn(`[MarketDataService] No data available for ${symbol} from any source`);
        return null;
      }

      const aggregated = aggregator.aggregateQuotes(validPoints);
      if (aggregated) {
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
   * Get crypto rankings (from CoinMarketCap)
   */
  async getCryptoRankings(limit: number = 50): Promise<CryptoRanking[]> {
    try {
      return await coinmarketcapSource.getListingsLatest(limit);
    } catch (error) {
      console.error('[MarketDataService] Error fetching rankings:', error);
      return [];
    }
  }

  /**
   * Get global market metrics
   */
  async getGlobalMetrics(): Promise<GlobalMarketMetrics | null> {
    try {
      return await coinmarketcapSource.getGlobalMetrics();
    } catch {
      return null;
    }
  }

  /**
   * Get market indices (from Yahoo Finance)
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      return await yahooSource.getMarketIndices();
    } catch {
      return [];
    }
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      return await yahooSource.getSectorPerformance();
    } catch {
      return [];
    }
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
      } catch {}
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
      return await coinmarketcapSource.getTrendingCoins(limit);
    } catch {
      return [];
    }
  }

  /**
   * Get gainers and losers
   */
  async getGainersLosers(limit: number = 10): Promise<{ gainers: CryptoRanking[]; losers: CryptoRanking[] }> {
    try {
      return await coinmarketcapSource.getGainersLosers(limit);
    } catch {
      return { gainers: [], losers: [] };
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
      const wsUrl = 'wss://ws-feed.pro.coinbase.com';
      const ws = new WebSocket(wsUrl);
      
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
            // Emit real-time price update
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
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.subscribeToSymbol(symbol, assetClass), 5000);
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
}

// Singleton instance
export const marketDataService = new MarketDataService();