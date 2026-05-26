import { DataSource, MarketDataPoint } from '../types';

const API_KEY = import.meta.env.VITE_COINDESK_API_KEY || '';
const BASE_URL = 'https://data-api.coindesk.com';

export const coindeskSource = {
  sourceId: 'coindesk' as DataSource,

  async getReferenceRates(symbols: string[]): Promise<MarketDataPoint[]> {
    const url = `${BASE_URL}/v1/reference-rates/current?symbols=${symbols.join(',')}`;
    const res = await fetch(url, {
      headers: API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {},
    });
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
    const url = `${BASE_URL}/v1/index-prices/current?symbols=${symbols.join(',')}&api_key=${API_KEY || 'demo'}`;
    const res = await fetch(url);
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
    const url = `${BASE_URL}/v1/reference-rates/historical?symbol=${symbol}&start=${startDate}&end=${endDate}`;
    const res = await fetch(url, {
      headers: API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {},
    });
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
    const url = `${BASE_URL}/v1/volatility?days=${days}&api_key=${API_KEY || 'demo'}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  async getMarketDepth(symbol: string): Promise<{ bids: any[]; asks: any[] }> {
    const url = `${BASE_URL}/v1/orderbook/l2?symbol=${symbol}&api_key=${API_KEY || 'demo'}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || { bids: [], asks: [] };
  },
};