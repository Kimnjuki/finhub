import { DataSource, MarketDataPoint } from '../types';
import { proxyFetch, buildProxyUrl } from '../httpClient';

const API_KEY = import.meta.env.VITE_COINDESK_API_KEY || '';
const SERVICE = 'coindesk';

export const coindeskSource = {
  sourceId: 'coindesk' as DataSource,

  async getReferenceRates(symbols: string[]): Promise<MarketDataPoint[]> {
    const url = `https://data-api.coindesk.com/v1/reference-rates/current?symbols=${symbols.join(',')}&api_key=${API_KEY}`;
    const res = await proxyFetch(SERVICE, url);
    if (!res.ok) {
      console.warn(`[CoinDesk] API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    
    return (data.data || []).map((r: any) => ({
      sourceId: 'coindesk' as DataSource,
      symbol: r.asset,
      assetClass: 'crypto' as const,
      timestamp: new Date(r.timestamp || Date.now()).getTime(),
      price: r.value,
      bid: r.bid,
      ask: r.ask,
      spread: r.spread ? (r.spread / r.value) * 10000 : undefined,
    }));
  },

  async getIndexPrices(symbols: string[]): Promise<MarketDataPoint[]> {
    const url = `https://data-api.coindesk.com/v1/index-prices/current?symbols=${symbols.join(',')}&api_key=${API_KEY || 'demo'}`;
    const res = await proxyFetch(SERVICE, url);
    if (!res.ok) {
      console.warn(`[CoinDesk] API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    
    return (data.data || []).map((r: any) => ({
      sourceId: 'coindesk' as DataSource,
      symbol: r.asset,
      assetClass: 'crypto' as const,
      timestamp: new Date(r.timestamp || Date.now()).getTime(),
      price: r.value,
    }));
  },

  async getHistoricalReferenceRates(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<MarketDataPoint[]> {
    const url = `https://data-api.coindesk.com/v1/reference-rates/historical?symbol=${symbol}&start=${startDate}&end=${endDate}`;
    const res = await proxyFetch(SERVICE, url);
    if (!res.ok) {
      console.warn(`[CoinDesk] API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    
    return (data.data || []).map((r: any) => ({
      sourceId: 'coindesk' as DataSource,
      symbol: r.asset || symbol,
      assetClass: 'crypto' as const,
      timestamp: new Date(r.timestamp).getTime(),
      price: r.value,
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
    }));
  },

  async getVolatilityIndex(days: number = 30): Promise<{ symbol: string; volatility: number }[]> {
    const url = `https://data-api.coindesk.com/v1/volatility?days=${days}&api_key=${API_KEY || 'demo'}`;
    const res = await proxyFetch(SERVICE, url);
    if (!res.ok) {
      console.warn(`[CoinDesk] API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.data || [];
  },

  async getMarketDepth(symbol: string): Promise<{ bids: any[]; asks: any[] }> {
    const url = `https://data-api.coindesk.com/v1/orderbook/l2?symbol=${symbol}&api_key=${API_KEY || 'demo'}`;
    const res = await proxyFetch(SERVICE, url);
    if (!res.ok) {
      console.warn(`[CoinDesk] API returned ${res.status}`);
      return { bids: [], asks: [] };
    }
    const data = await res.json();
    return data.data || { bids: [], asks: [] };
  },
};