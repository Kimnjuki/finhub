import { DataSource, MarketDataPoint, NewsItem, TechnicalIndicator, TimeInterval, Candle } from '../types';
import { proxyFetch } from '../httpClient';

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY || 'demo';
const SERVICE = 'twelvedata';
const BASE_URL = 'https://api.twelvedata.com';

class RateLimiter {
  private lastCallTime = 0;
  private minInterval = 100; // Twelve Data: very generous free plan

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

const limiter = new RateLimiter();

export const twelvedataSource = {
  sourceId: 'twelvedata' as DataSource,

  async getTimeSeries(
    symbol: string,
    interval: TimeInterval = '1d',
    outputSize: number = 30
  ): Promise<MarketDataPoint[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputSize}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      const values = data.values || [];
      return values.map((v: any) => ({
        sourceId: 'twelvedata',
        symbol,
        assetClass: 'stock' as const,
        timestamp: new Date(v.datetime).getTime(),
        price: parseFloat(v.close),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        volume: parseInt(v.volume),
      }));
    });
  },

  async getQuote(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      return {
        sourceId: 'twelvedata',
        symbol,
        assetClass: 'stock' as const,
        timestamp: Date.now(),
        price: parseFloat(data.close || data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        volume: parseInt(data.volume),
        open: parseFloat(data.open),
      };
    });
  },

  async getForexRate(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/exchange_rate?symbol=${symbol}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      return {
        sourceId: 'twelvedata',
        symbol,
        assetClass: 'forex' as const,
        timestamp: Date.now(),
        price: parseFloat(data.rate),
        bid: parseFloat(data.rate),
        ask: parseFloat(data.rate),
      };
    });
  },

  async getCryptoQuote(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      return {
        sourceId: 'twelvedata',
        symbol,
        assetClass: 'crypto' as const,
        timestamp: Date.now(),
        price: parseFloat(data.close || data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        volume: parseInt(data.volume),
      };
    });
  },

  async getIndicators(
    symbol: string,
    indicator: string,
    interval: string = '1d',
    timePeriod: number = 14
  ): Promise<TechnicalIndicator[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/${indicator}?symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      const values = data.values || [];
      const meta = data.meta || {};

      return values.map((v: any) => ({
        symbol,
        sourceId: 'twelvedata',
        indicator,
        value: parseFloat(String(Object.values(v).find((val: any) => typeof val === 'number') ?? 0)) || 0,
        signal: 'neutral' as const,
        timestamp: new Date(v.datetime).getTime(),
        interval: interval as TimeInterval,
        parameters: { timePeriod },
      }));
    });
  },

  async getMarketNews(limit: number = 20): Promise<NewsItem[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/news?limit=${limit}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();

      if (data.code) throw new Error(`Twelve Data: ${data.message || data.code}`);

      return (data.data || []).map((item: any) => ({
        id: String(item.id || `${Date.now()}-${Math.random()}`),
        title: item.title,
        summary: item.description || item.title,
        url: item.url,
        source: 'twelvedata' as DataSource,
        sourceName: item.source || 'Twelve Data',
        publishedAt: new Date(item.published_at || Date.now()).getTime(),
        symbols: item.symbols || [],
        categories: item.categories || [],
        sentiment: item.sentiment,
        sentimentScore: item.sentiment_score,
        imageUrl: item.image_url,
        author: item.source,
      }));
    });
  },

  async getSymbolSearch(keywords: string): Promise<any[]> {
    return limiter.throttle(async () => {
      const url = `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(keywords)}&apikey=${API_KEY}`;
      const res = await proxyFetch(SERVICE, url);
      const data = await res.json();
      return data.data || [];
    });
  },
};