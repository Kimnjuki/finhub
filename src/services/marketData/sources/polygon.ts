import { DataSource, MarketDataPoint, OrderBook, Trade, Candle, NewsItem, TimeInterval } from '../types';

const API_KEY = import.meta.env.VITE_POLYGON_API_KEY || '';
const BASE_URL = 'https://api.polygon.io';

class RateLimiter {
  private lastCallTime = 0;
  private minInterval: number;

  constructor(callsPerMinute: number) {
    this.minInterval = 60000 / callsPerMinute;
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLast = now - this.lastCallTime;
    if (timeSinceLast < this.minInterval) {
      await new Promise(r => setTimeout(r, this.minInterval - timeSinceLast));
    }
    this.lastCallTime = Date.now();
    return fn();
  }
}

const limiter = new RateLimiter(5);

export const polygonSource = {
  sourceId: 'polygon' as DataSource,
  
  async getAggregatesBars(
    symbol: string,
    multiplier: number = 1,
    timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
    from: string,
    to: string
  ): Promise<Candle[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status !== 'OK') throw new Error(`Polygon API error: ${data.error || 'Unknown'}`);
      
      return (data.results || []).map((r: any) => ({
        symbol,
        sourceId: 'polygon' as DataSource,
        interval: timespan === 'minute' ? '1m' as TimeInterval : '1d' as TimeInterval,
        open: r.o,
        high: r.h,
        low: r.l,
        close: r.c,
        volume: r.v,
        timestamp: r.t,
        vwap: r.vw,
        trades: r.n,
      }));
    });
  },

  async getTrades(symbol: string, limit: number = 100): Promise<Trade[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v3/trades/${symbol}?limit=${limit}&apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      return (data.results || []).map((r: any) => ({
        id: String(r.id || r.t),
        symbol,
        sourceId: 'polygon' as DataSource,
        price: r.p,
        size: r.s,
        side: r.side === 1 ? 'buy' as const : r.side === -1 ? 'sell' as const : 'unknown' as const,
        timestamp: r.t,
        exchange: 'polygon',
      }));
    });
  },

  async getLastQuote(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v2/last/nbbo/${symbol}?apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status !== 'OK') throw new Error(`Polygon API error for ${symbol}`);
      
      const quote = data.results;
      return {
        sourceId: 'polygon',
        symbol,
        assetClass: symbol.includes('-') ? 'crypto' : 'stock',
        timestamp: quote.t,
        price: (quote.P + quote.p) / 2,
        bid: quote.P,
        ask: quote.p,
        spread: ((quote.p - quote.P) / quote.P) * 10000,
      };
    });
  },

  async getPreviousClose(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/prev?apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      const result = data.results?.[0];
      return {
        sourceId: 'polygon',
        symbol,
        assetClass: 'stock',
        timestamp: result.t,
        price: result.c,
        open: result.o,
        high: result.h,
        low: result.l,
        close: result.c,
        volume: result.v,
        vwap: result.vw,
      };
    });
  },

  async getMarketNews(limit: number = 10): Promise<NewsItem[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v2/reference/news?limit=${limit}&apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      return (data.results || []).map((r: any) => ({
        id: String(r.id),
        title: r.title,
        summary: r.description || r.title,
        url: r.article_url,
        source: 'polygon' as DataSource,
        sourceName: r.publisher?.name || 'Polygon News',
        publishedAt: new Date(r.published_utc).getTime(),
        symbols: r.tickers || [],
        categories: r.categories || [],
        sentiment: r.sentiment === 'positive' ? 'bullish' : r.sentiment === 'negative' ? 'bearish' : 'neutral',
        imageUrl: r.image_url,
        author: r.author,
      }));
    });
  },

  async getTickerDetails(symbol: string): Promise<any> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.results;
    });
  },

  async getOptionsChain(symbol: string, expirationDate?: string): Promise<any[]> {
    return limiter.throttle(async () => {
      const params = new URLSearchParams({ apiKey: API_KEY });
      if (expirationDate) params.set('expiration_date', expirationDate);
      const url = `${BASE_URL}/v3/reference/options/contracts/${symbol}?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.results || [];
    });
  },

  // WebSocket connection for real-time data
  createWebSocket(): WebSocket | null {
    if (!API_KEY) {
      console.warn('[Polygon] No API key configured for WebSocket');
      return null;
    }
    const ws = new WebSocket(`wss://delayed.polygon.io/stocks?apiKey=${API_KEY}`);
    return ws;
  },
};