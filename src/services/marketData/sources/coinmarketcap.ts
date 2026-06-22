import { DataSource, CryptoRanking, GlobalMarketMetrics } from '../types';
import { proxyFetch, buildProxyUrl } from '../httpClient';

const API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY || '';
const BASE_URL = 'https://pro-api.coinmarketcap.com';
const SERVICE = 'coinmarketcap';

const headers = {
  'X-CMC_PRO_API_KEY': API_KEY,
  'Accept': 'application/json',
};

export const coinmarketcapSource = {
  sourceId: 'coinmarketcap' as DataSource,

  async getListingsLatest(
    limit: number = 100,
    convert: string = 'USD'
  ): Promise<CryptoRanking[]> {
    if (!API_KEY) {
      console.warn('[CoinMarketCap] No API key configured, using mock data');
      return getMockRankings(limit);
    }
    
    const url = `${BASE_URL}/v1/cryptocurrency/listings/latest?limit=${limit}&convert=${convert}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    if (data.status?.error_code !== 0) throw new Error(`CMC API error: ${data.status?.error_message}`);
    
    return (data.data || []).map((c: any) => ({
      rank: c.cmc_rank,
      symbol: c.symbol,
      name: c.name,
      price: c.quote[convert].price,
      marketCap: c.quote[convert].market_cap,
      volume24h: c.quote[convert].volume_24h,
      circulatingSupply: c.circulating_supply,
      totalSupply: c.total_supply,
      maxSupply: c.max_supply,
      change1h: c.quote[convert].percent_change_1h,
      change24h: c.quote[convert].percent_change_24h,
      change7d: c.quote[convert].percent_change_7d,
      dominance: c.quote[convert].market_cap_dominance,
      tags: c.tags || [],
    }));
  },

  async getQuotes(symbols: string[], convert: string = 'USD'): Promise<CryptoRanking[]> {
    if (!API_KEY) return [];
    
    const url = `${BASE_URL}/v2/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}&convert=${convert}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    if (data.status?.error_code !== 0) throw new Error(`CMC API error: ${data.status?.error_message}`);
    
    const results: CryptoRanking[] = [];
    Object.values(data.data || {}).forEach((entries: any) => {
      entries.forEach((c: any) => {
        results.push({
          rank: c.cmc_rank || 0,
          symbol: c.symbol,
          name: c.name,
          price: c.quote[convert].price,
          marketCap: c.quote[convert].market_cap,
          volume24h: c.quote[convert].volume_24h,
          circulatingSupply: c.circulating_supply,
          totalSupply: c.total_supply,
          maxSupply: c.max_supply,
          change1h: c.quote[convert].percent_change_1h,
          change24h: c.quote[convert].percent_change_24h,
          change7d: c.quote[convert].percent_change_7d,
          tags: c.tags || [],
        });
      });
    });
    
    return results;
  },

  async getGlobalMetrics(convert: string = 'USD'): Promise<GlobalMarketMetrics> {
    if (!API_KEY) return getMockGlobalMetrics();
    
    const url = `${BASE_URL}/v1/global-metrics/quotes/latest?convert=${convert}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    if (data.status?.error_code !== 0) throw new Error(`CMC API error: ${data.status?.error_message}`);
    
    const q = data.data.quote[convert];
    return {
      totalMarketCap: q.total_market_cap,
      totalVolume24h: q.total_volume_24h,
      btcDominance: q.btc_dominance,
      ethDominance: q.eth_dominance,
      defiMarketCap: q.defi_market_cap || 0,
      stablecoinMarketCap: q.stablecoin_market_cap || 0,
      totalCryptocurrencies: data.data.total_cryptocurrencies,
      totalExchanges: data.data.total_exchanges,
      btcVolume24h: q.volume_24h * (q.btc_dominance / 100),
      ethVolume24h: q.volume_24h * (q.eth_dominance / 100),
      timestamp: Date.now(),
    };
  },

  async getTrendingCoins(limit: number = 10): Promise<CryptoRanking[]> {
    if (!API_KEY) return getMockRankings(limit).slice(0, limit);
    
    const url = `${BASE_URL}/v1/cryptocurrency/trending/latest?limit=${limit}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    return (data.data || []).map((c: any) => ({
      rank: c.cmc_rank,
      symbol: c.symbol,
      name: c.name,
      price: c.quote.USD.price,
      marketCap: c.quote.USD.market_cap || 0,
      volume24h: c.quote.USD.volume_24h || 0,
      circulatingSupply: c.circulating_supply || 0,
      change1h: c.quote.USD.percent_change_1h || 0,
      change24h: c.quote.USD.percent_change_24h || 0,
      change7d: c.quote.USD.percent_change_7d || 0,
      tags: c.tags || [],
    }));
  },

  async getGainersLosers(limit: number = 10): Promise<{ gainers: CryptoRanking[]; losers: CryptoRanking[] }> {
    if (!API_KEY) return { gainers: [], losers: [] };
    
    const url = `${BASE_URL}/v1/cryptocurrency/trending/gainers-losers?limit=${limit}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    const mapItem = (c: any): CryptoRanking => ({
      rank: c.cmc_rank,
      symbol: c.symbol,
      name: c.name,
      price: c.quote.USD.price,
      marketCap: c.quote.USD.market_cap || 0,
      volume24h: c.quote.USD.volume_24h || 0,
      circulatingSupply: c.circulating_supply || 0,
      change1h: c.quote.USD.percent_change_1h || 0,
      change24h: c.quote.USD.percent_change_24h || 0,
      change7d: c.quote.USD.percent_change_7d || 0,
      tags: c.tags || [],
    });
    
    return {
      gainers: (data.data?.gainers || []).map(mapItem),
      losers: (data.data?.losers || []).map(mapItem),
    };
  },

  async getExchangeListings(limit: number = 20): Promise<any[]> {
    if (!API_KEY) return [];
    
    const url = `${BASE_URL}/v1/exchange/listings/latest?limit=${limit}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    return (data.data || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      volume24h: e.quote.USD.volume_24h,
      totalPairs: e.num_of_pairs || 0,
      marketPairs: e.market_pairs || 0,
      trustScore: e.trust_score || 'unknown',
      lastUpdated: e.last_updated,
    }));
  },

  async getMetadata(symbol: string): Promise<any> {
    if (!API_KEY) return null;
    
    const url = `${BASE_URL}/v2/cryptocurrency/info?symbol=${symbol}`;
    const res = await proxyFetch(SERVICE, url, { headers });
    const data = await res.json();
    
    const entries = data.data?.[symbol];
    if (!entries || entries.length === 0) return null;
    
    const c = entries[0];
    return {
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      description: c.description,
      logo: c.logo,
      category: c.category,
      tags: c.tags || [],
      platforms: c.platforms || {},
      dateAdded: c.date_added,
      urls: c.urls,
    };
  },
};

function getMockRankings(limit: number): CryptoRanking[] {
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin', price: 67890, mc: 1.32e12, vol: 4.2e10, supply: 19.5e6 },
    { symbol: 'ETH', name: 'Ethereum', price: 3450, mc: 4.1e11, vol: 2.1e10, supply: 120e6 },
    { symbol: 'SOL', name: 'Solana', price: 151, mc: 6.5e10, vol: 3.5e9, supply: 430e6 },
    { symbol: 'BNB', name: 'BNB', price: 585, mc: 8.9e10, vol: 1.8e9, supply: 153e6 },
    { symbol: 'XRP', name: 'XRP', price: 0.62, mc: 3.3e10, vol: 1.2e9, supply: 54e9 },
    { symbol: 'ADA', name: 'Cardano', price: 0.45, mc: 1.6e10, vol: 6.5e8, supply: 35e9 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, mc: 1.7e10, vol: 8.2e8, supply: 142e9 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.25, mc: 9.5e9, vol: 4.1e8, supply: 1.3e9 },
    { symbol: 'AVAX', name: 'Avalanche', price: 35.5, mc: 1.3e10, vol: 5.2e8, supply: 370e6 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.85, mc: 7.9e9, vol: 3.8e8, supply: 9.3e9 },
  ];
  
  return coins.slice(0, limit).map((c, i) => ({
    rank: i + 1,
    symbol: c.symbol,
    name: c.name,
    price: c.price,
    marketCap: c.mc,
    volume24h: c.vol,
    circulatingSupply: c.supply,
    change1h: (Math.random() - 0.5) * 6,
    change24h: (Math.random() - 0.5) * 20,
    change7d: (Math.random() - 0.5) * 40,
    tags: [],
  }));
}

function getMockGlobalMetrics(): GlobalMarketMetrics {
  return {
    totalMarketCap: 2.5e12,
    totalVolume24h: 8.5e10,
    btcDominance: 48.5,
    ethDominance: 16.2,
    defiMarketCap: 6.5e10,
    stablecoinMarketCap: 1.6e11,
    totalCryptocurrencies: 12500,
    totalExchanges: 450,
    btcVolume24h: 4.1e10,
    ethVolume24h: 1.55e10,
    timestamp: Date.now(),
  };
}