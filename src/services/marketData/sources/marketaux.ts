import { DataSource, NewsItem } from '../types';
import { proxyFetch } from '../httpClient';

const API_KEY = import.meta.env.VITE_MARKETAUX_API_KEY || 'demo';
const SERVICE = 'marketaux';
const BASE_URL = 'https://api.marketaux.com/v1';

export const marketauxSource = {
  sourceId: 'marketaux' as DataSource,

  async getMarketNews(
    params?: {
      symbols?: string[];
      countries?: string[];
      industries?: string[];
      limit?: number;
    }
  ): Promise<NewsItem[]> {
    const { symbols, countries, industries, limit = 20 } = params || {};

    const url = new URL(`${BASE_URL}/news/all`);
    url.searchParams.set('api_token', API_KEY);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('filter_entities', 'true');
    url.searchParams.set('language', 'en');

    if (symbols && symbols.length) {
      url.searchParams.set('symbols', symbols.join(','));
    }
    if (countries && countries.length) {
      url.searchParams.set('countries', countries.join(','));
    }
    if (industries && industries.length) {
      url.searchParams.set('industries', industries.join(','));
    }

    const res = await proxyFetch(SERVICE, url.toString());
    const data = await res.json();

    return (data.data || []).map((item: any) => ({
      id: String(item.id || item.uuid),
      title: item.title,
      summary: item.description || item.title,
      url: item.url,
      source: 'marketaux' as DataSource,
      sourceName: item.source || 'Marketaux',
      publishedAt: new Date(item.published_at).getTime(),
      symbols: item.entities?.map((e: any) => e.symbol).filter(Boolean) || [],
      categories: industries || [],
      sentiment: item.sentiment,
      sentimentScore: item.sentiment_score,
      imageUrl: item.image_url,
      author: item.source,
    }));
  },

  async getNewsBySymbol(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    return this.getMarketNews({ symbols: [symbol], limit });
  },

  async getNewsByIndustry(industry: string, limit: number = 20): Promise<NewsItem[]> {
    return this.getMarketNews({ industries: [industry], limit });
  },

  async getNewsByCountry(countryCodes: string[], limit: number = 20): Promise<NewsItem[]> {
    return this.getMarketNews({ countries: countryCodes, limit });
  },
};