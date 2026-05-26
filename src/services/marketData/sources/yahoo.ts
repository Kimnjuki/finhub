import { DataSource, MarketDataPoint, MarketIndex, SectorPerformance, NewsItem } from '../types';

const BASE_URL = 'https://query1.finance.yahoo.com';

export const yahooSource = {
  sourceId: 'yahoo' as DataSource,

  async getQuote(symbol: string): Promise<any> {
    const url = `${BASE_URL}/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url);
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) throw new Error(`Yahoo: No data for ${symbol}`);
    
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    return {
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      high: quote?.high?.[0] || meta.regularMarketDayHigh,
      low: quote?.low?.[0] || meta.regularMarketDayLow,
      volume: quote?.volume?.[0] || meta.regularMarketVolume,
      marketCap: meta.marketCap,
      timestamp: meta.regularMarketTime * 1000,
    };
  },

  async getMarketIndices(): Promise<MarketIndex[]> {
    const symbols = ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX', '^FTSE', '^N225', '^HSI'];
    const url = `${BASE_URL}/v7/finance/quote?symbols=${symbols.join(',')}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.quoteResponse?.result || []).map((r: any) => ({
      symbol: r.symbol,
      name: r.shortName || r.longName || r.symbol,
      price: r.regularMarketPrice,
      change: r.regularMarketChange,
      changePercent: r.regularMarketChangePercent,
      volume: r.regularMarketVolume,
      timestamp: r.regularMarketTime * 1000,
    }));
  },

  async getChartData(
    symbol: string,
    interval: string = '1d',
    range: string = '1mo'
  ): Promise<{ timestamps: number[]; open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> {
    const url = `${BASE_URL}/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const res = await fetch(url);
    const data = await res.json();
    const result = data.chart?.result?.[0];
    
    if (!result) throw new Error(`Yahoo: No chart data for ${symbol}`);
    
    const quote = result.indicators?.quote?.[0];
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose;
    
    return {
      timestamps: result.timestamp || [],
      open: quote?.open || [],
      high: quote?.high || [],
      low: quote?.low || [],
      close: adjClose || quote?.close || [],
      volume: quote?.volume || [],
    };
  },

  async getTrendingSymbols(region: string = 'US'): Promise<{ symbol: string; name: string; price: number; changePercent: number }[]> {
    const url = `${BASE_URL}/v1/finance/trending/${region}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.finance?.result?.[0]?.quotes || []).map((r: any) => ({
      symbol: r.symbol,
      name: r.shortName || r.longName || r.symbol,
      price: r.regularMarketPrice,
      changePercent: r.regularMarketChangePercent,
    }));
  },

  async getSectorPerformance(): Promise<SectorPerformance[]> {
    const url = `${BASE_URL}/v6/finance/quote/marketSummary`;
    const res = await fetch(url);
    const data = await res.json();
    
    const sectors = [
      { symbol: 'XLF', name: 'Financial' },
      { symbol: 'XLK', name: 'Technology' },
      { symbol: 'XLV', name: 'Healthcare' },
      { symbol: 'XLY', name: 'Consumer Cyclical' },
      { symbol: 'XLP', name: 'Consumer Defensive' },
      { symbol: 'XLE', name: 'Energy' },
      { symbol: 'XLI', name: 'Industrial' },
      { symbol: 'XLB', name: 'Materials' },
      { symbol: 'XLU', name: 'Utilities' },
      { symbol: 'XLRE', name: 'Real Estate' },
      { symbol: 'XLC', name: 'Communication' },
    ];
    
    const quotesUrl = `${BASE_URL}/v7/finance/quote?symbols=${sectors.map(s => s.symbol).join(',')}`;
    const quotesRes = await fetch(quotesUrl);
    const quotesData = await quotesRes.json();
    
    return (quotesData.quoteResponse?.result || []).map((r: any) => {
      const sector = sectors.find(s => s.symbol === r.symbol);
      return {
        sector: sector?.name || r.shortName || r.symbol,
        changePercent: r.regularMarketChangePercent || 0,
        topGainer: '',
        topGainerChange: 0,
        timestamp: Date.now(),
      };
    });
  },

  async getKeyStatistics(symbol: string): Promise<any> {
    const url = `${BASE_URL}/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,financialData,summaryDetail,price`;
    const res = await fetch(url);
    const data = await res.json();
    return data.quoteSummary?.result?.[0];
  },

  async getRecommendations(symbol: string): Promise<any[]> {
    const url = `${BASE_URL}/v6/finance/recommendationsbysymbol/${symbol}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.finance?.result?.[0]?.recommendedSymbols || [];
  },

  async getInsights(symbol: string): Promise<any> {
    const url = `${BASE_URL}/ws/insights/v2/finance/insights?symbol=${symbol}`;
    const res = await fetch(url);
    return res.json();
  },

  async getNews(symbol: string, count: number = 10): Promise<NewsItem[]> {
    const url = `${BASE_URL}/v1/finance/search?q=${symbol}&newsCount=${count}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.news || []).map((n: any) => ({
      id: n.uuid,
      title: n.title,
      summary: n.summary || n.title,
      url: n.link,
      source: 'yahoo' as DataSource,
      sourceName: n.publisher || 'Yahoo Finance',
      publishedAt: new Date(n.providerPublishTime * 1000).getTime(),
      symbols: [symbol],
      categories: n.relatedTickers || [],
      imageUrl: n.thumbnail?.resolutions?.[0]?.url,
    }));
  },

  async searchSymbols(query: string): Promise<{ symbol: string; name: string; type: string; exchange: string }[]> {
    const url = `${BASE_URL}/v1/finance/search?q=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.quotes || []).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType || 'EQUITY',
      exchange: q.exchange || 'UNKNOWN',
    }));
  },
};