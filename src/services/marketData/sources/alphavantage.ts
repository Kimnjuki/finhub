import { DataSource, MarketDataPoint, TechnicalIndicator, TimeInterval } from '../types';
import { proxyFetch, buildProxyUrl } from '../httpClient';

const API_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || 'demo';
const SERVICE = 'alphavantage';

class RateLimiter {
  private lastCallTime = 0;
  private minInterval = 13000; // Alpha Vantage: 5 calls/min

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

async function avFetch(params: Record<string, string>): Promise<any> {
  const url = `https://www.alphavantage.co/query?${new URLSearchParams({ ...params, apikey: API_KEY })}`;
  const res = await proxyFetch(SERVICE, url);
  return res.json();
}

export const alphavantageSource = {
  sourceId: 'alphavantage' as DataSource,

  async getStockQuote(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: 'GLOBAL_QUOTE', symbol });
      const q = data['Global Quote'];
      if (!q || !q['05. price']) throw new Error(`Alpha Vantage: No data for ${symbol}`);
      
      return {
        sourceId: 'alphavantage',
        symbol,
        assetClass: 'stock',
        timestamp: Date.now(),
        price: parseFloat(q['05. price']),
        change: parseFloat(q['09. change']),
        changePercent: parseFloat(q['10. change percent'].replace('%', '')),
        high: parseFloat(q['03. high']),
        low: parseFloat(q['04. low']),
        volume: parseInt(q['06. volume']),
      };
    });
  },

  async getForexRate(from: string, to: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: from, to_currency: to });
      const r = data['Realtime Currency Exchange Rate'];
      if (!r) throw new Error(`Alpha Vantage: No forex data for ${from}/${to}`);
      
      return {
        sourceId: 'alphavantage',
        symbol: `${from}/${to}`,
        assetClass: 'forex',
        timestamp: new Date(r['6. Last Refreshed']).getTime(),
        price: parseFloat(r['5. Exchange Rate']),
        bid: parseFloat(r['8. Bid Price']),
        ask: parseFloat(r['9. Ask Price']),
      };
    });
  },

  async getCryptoRate(symbol: string, market: string = 'USD'): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: symbol, to_currency: market });
      const r = data['Realtime Currency Exchange Rate'];
      if (!r) throw new Error(`Alpha Vantage: No crypto data for ${symbol}`);
      
      return {
        sourceId: 'alphavantage',
        symbol: `${symbol}/${market}`,
        assetClass: 'crypto',
        timestamp: new Date(r['6. Last Refreshed']).getTime(),
        price: parseFloat(r['5. Exchange Rate']),
        bid: parseFloat(r['8. Bid Price']),
        ask: parseFloat(r['9. Ask Price']),
      };
    });
  },

  async getTimeSeriesDaily(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<MarketDataPoint[]> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: 'TIME_SERIES_DAILY', symbol, outputsize: outputSize });
      const series = data['Time Series (Daily)'];
      if (!series) throw new Error(`Alpha Vantage: No time series for ${symbol}`);
      
      return Object.entries(series).map(([date, vals]: [string, any]) => ({
        sourceId: 'alphavantage' as DataSource,
        symbol,
        assetClass: 'stock' as const,
        timestamp: new Date(date).getTime(),
        price: parseFloat(vals['4. close']),
        open: parseFloat(vals['1. open']),
        high: parseFloat(vals['2. high']),
        low: parseFloat(vals['3. low']),
        volume: parseInt(vals['5. volume']),
      })).reverse();
    });
  },

  async getTechnicalIndicator(
    symbol: string,
    indicator: string,
    interval: string = 'daily',
    timePeriod: number = 14
  ): Promise<TechnicalIndicator[]> {
    return limiter.throttle(async () => {
      const data = await avFetch({
        function: indicator,
        symbol,
        interval,
        time_period: String(timePeriod),
        series_type: 'close',
      });
      
      const metaKey = Object.keys(data).find(k => k.startsWith('Meta')) || '';
      const seriesKey = Object.keys(data).find(k => k.startsWith('Technical Analysis')) || '';
      const series = data[seriesKey];
      
      if (!series) throw new Error(`Alpha Vantage: No indicator data for ${symbol}`);
      
      return Object.entries(series).map(([date, vals]: [string, any]) => ({
        symbol,
        sourceId: 'alphavantage' as DataSource,
        indicator,
        value: parseFloat(Object.values(vals as object)[0] as string),
        signal: 'neutral' as const,
        timestamp: new Date(date).getTime(),
        interval: '1d' as TimeInterval,
        parameters: { timePeriod },
      })).reverse();
    });
  },

  async getSectorPerformance(): Promise<{ sector: string; changePercent: number }[]> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: 'SECTOR' });
      const sectors = data['Rank A: Real-Time Performance'];
      if (!sectors) return [];
      
      return Object.entries(sectors).map(([sector, change]: [string, any]) => ({
        sector: sector.replace(' & ', ' & '),
        changePercent: parseFloat(String(change).replace('%', '')),
      }));
    });
  },

  async getEconomicIndicator(indicator: string): Promise<any> {
    return limiter.throttle(async () => {
      const data = await avFetch({ function: indicator });
      return data;
    });
  },

  async getNewsSentiment(symbols: string[], limit: number = 50): Promise<any[]> {
    return limiter.throttle(async () => {
      const data = await avFetch({
        function: 'NEWS_SENTIMENT',
        tickers: symbols.join(','),
        limit: String(limit),
      });
      return data.feed || [];
    });
  },
};