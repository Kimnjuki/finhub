import { DataSource, NewsItem, CompanyFundamentals, InsiderTransaction, EarningsCalendar } from '../types';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';

export const finnhubSource = {
  sourceId: 'finnhub' as DataSource,

  async getQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number; high: number; low: number; volume: number } | null> {
    const url = `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.c || data.c === 0) return null;
    return {
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      volume: data.v,
    };
  },

  async getCompanyProfile(symbol: string): Promise<any> {
    const url = `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  },

  async getCompanyFundamentals(symbol: string): Promise<CompanyFundamentals> {
    const [profile, metrics] = await Promise.all([
      this.getCompanyProfile(symbol),
      this.getBasicFinancials(symbol),
    ]);

    const metricData = metrics?.metric || {};
    
    return {
      symbol,
      name: profile.name || symbol,
      sector: profile.finnhubIndustry || profile.sector,
      industry: profile.finnhubIndustry,
      marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1_000_000 : undefined,
      employees: profile.shareOutstanding ? Math.round(profile.shareOutstanding / 1000) : undefined,
      peRatio: metricData.peBasicExclExtraTTM,
      eps: metricData.epsTTM,
      dividendYield: metricData.currentDividendYieldTTM,
      beta: metricData.beta,
      sharesOutstanding: profile.shareOutstanding,
      revenue: metricData.revenueTTM,
      revenueGrowth: metricData.revenueGrowth,
      profitMargin: metricData.grossMarginTTM,
      description: profile.description,
      ipoDate: profile.ipo,
      sourceId: 'finnhub',
      timestamp: Date.now(),
    };
  },

  async getBasicFinancials(symbol: string): Promise<any> {
    const url = `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  },

  async getMarketNews(category: string = 'general', minId: number = 0): Promise<NewsItem[]> {
    const url = `${BASE_URL}/news?category=${category}&minId=${minId}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data || []).map((n: any) => ({
      id: String(n.id),
      title: n.headline,
      summary: n.summary,
      url: n.url,
      source: 'finnhub' as DataSource,
      sourceName: n.source || 'Finnhub',
      publishedAt: n.datetime * 1000,
      symbols: n.related || '',
      categories: [category],
      sentiment: n.sentiment === 'bullish' ? 'bullish' as const : n.sentiment === 'bearish' ? 'bearish' as const : 'neutral' as const,
      sentimentScore: n.sentimentScore,
      imageUrl: n.image,
    }));
  },

  async getCompanyNews(symbol: string, from: string, to: string): Promise<NewsItem[]> {
    const url = `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data || []).map((n: any) => ({
      id: String(n.id),
      title: n.headline,
      summary: n.summary,
      url: n.url,
      source: 'finnhub' as DataSource,
      sourceName: n.source || 'Finnhub',
      publishedAt: n.datetime * 1000,
      symbols: [symbol],
      categories: [],
      sentiment: n.sentiment === 'bullish' ? 'bullish' as const : n.sentiment === 'bearish' ? 'bearish' as const : 'neutral' as const,
      sentimentScore: n.sentimentScore,
      imageUrl: n.image,
    }));
  },

  async getNewsSentiment(symbol: string): Promise<{ buzz: number; score: number; articles: number }> {
    const url = `${BASE_URL}/news-sentiment?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      buzz: data.buzz?.buzz || 0,
      score: data.sentiment?.score || 0,
      articles: data.buzz?.articlesInLastWeek || 0,
    };
  },

  async getSocialSentiment(symbol: string): Promise<{ reddit: number; twitter: number }> {
    const url = `${BASE_URL}/stock/social-sentiment?symbol=${symbol}&from=2024-01-01&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const reddit = data?.socialSentiment?.reduce((s: number, r: any) => s + (r.score || 0), 0) || 0;
    return { reddit, twitter: 0 };
  },

  async getRecommendationTrends(symbol: string): Promise<any[]> {
    const url = `${BASE_URL}/stock/recommendation?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  },

  async getEarningsCalendar(from: string, to: string): Promise<EarningsCalendar[]> {
    const url = `${BASE_URL}/calendar/earnings?from=${from}&to=${to}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.earningsCalendar || []).map((e: any) => ({
      symbol: e.symbol,
      name: e.name || e.symbol,
      date: new Date(e.date).getTime(),
      quarter: e.quarter ? `Q${e.quarter} ${e.year}` : '',
      estimatedEps: e.epsEstimate || 0,
      estimatedRevenue: e.revenueEstimate || 0,
      actualEps: e.eps,
      actualRevenue: e.revenue,
      sourceId: 'finnhub' as DataSource,
    }));
  },

  async getIpoCalendar(from: string, to: string): Promise<any[]> {
    const url = `${BASE_URL}/calendar/ipo?from=${from}&to=${to}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.ipoCalendar || [];
  },

  async getInsiderTransactions(symbol: string, from: string, to: string): Promise<InsiderTransaction[]> {
    const url = `${BASE_URL}/stock/insider-transactions?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return (data.data || []).map((t: any) => ({
      symbol,
      company: t.company?.name || symbol,
      insider: t.name || t.reportingName || 'Unknown',
      position: t.position || '',
      transactionType: t.transactionType?.includes('Buy') ? 'buy' as const : 'sell' as const,
      shares: t.shares || 0,
      price: t.price || 0,
      totalValue: (t.shares || 0) * (t.price || 0),
      date: new Date(t.transactionDate).getTime(),
      sourceId: 'finnhub' as DataSource,
    }));
  },

  async getEtfHoldings(symbol: string): Promise<any[]> {
    const url = `${BASE_URL}/etf/holdings?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data || [];
  },

  async getSimilarSymbols(symbol: string): Promise<string[]> {
    const url = `${BASE_URL}/stock/peers?symbol=${symbol}&token=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  },

  async getCryptoCandles(symbol: string, resolution: string, from: number, to: number): Promise<any> {
    const url = `${BASE_URL}/crypto/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`;
    const res = await fetch(url);
    return res.json();
  },

  // WebSocket for real-time quotes
  createWebSocket(symbols: string[]): WebSocket | null {
    if (API_KEY === 'demo') {
      console.warn('[Finnhub] WebSocket requires a paid API key');
      return null;
    }
    const ws = new WebSocket(`${BASE_URL.replace('https', 'wss')}/ws?token=${API_KEY}`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', symbol: symbols.join(',') }));
    };
    return ws;
  },
};