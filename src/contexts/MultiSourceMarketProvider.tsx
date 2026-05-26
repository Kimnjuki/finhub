import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { marketDataService } from '@/services/marketData';
import { AggregatedQuote, GlobalMarketMetrics, MarketIndex, CryptoRanking, NewsItem, SectorPerformance, SourceHealth, DataSource } from '@/services/marketData/types';

interface MultiSourceMarketContextType {
  initialized: boolean;
  globalMetrics: GlobalMarketMetrics | null;
  marketIndices: MarketIndex[];
  topRankings: CryptoRanking[];
  trendingCoins: CryptoRanking[];
  marketNews: NewsItem[];
  sectorPerformance: SectorPerformance[];
  sourceHealth: Map<DataSource, SourceHealth>;
  searchSymbols: (query: string) => Promise<any[]>;
  getQuote: (symbol: string) => Promise<AggregatedQuote | null>;
  refreshAll: () => Promise<void>;
}

const MultiSourceMarketContext = createContext<MultiSourceMarketContextType | null>(null);

export const MultiSourceMarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMarketMetrics | null>(null);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topRankings, setTopRankings] = useState<CryptoRanking[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<CryptoRanking[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance[]>([]);

  useEffect(() => {
    const init = async () => {
      await marketDataService.initialize();
      setInitialized(true);
    };
    init();
  }, []);

  const refreshAll = async () => {
    try {
      const [metrics, indices, rankings, trending, news, sectors] = await Promise.all([
        marketDataService.getGlobalMetrics(),
        marketDataService.getMarketIndices(),
        marketDataService.getCryptoRankings(10),
        marketDataService.getTrendingCoins(10),
        marketDataService.getMarketNews(undefined, 15),
        marketDataService.getSectorPerformance(),
      ]);

      if (metrics) setGlobalMetrics(metrics);
      setMarketIndices(indices);
      setTopRankings(rankings);
      setTrendingCoins(trending);
      setMarketNews(news);
      setSectorPerformance(sectors);
    } catch (err) {
      console.error('[MultiSourceMarket] Error refreshing data:', err);
    }
  };

  // Initial refresh after init
  useEffect(() => {
    if (initialized) {
      refreshAll();
      const interval = setInterval(refreshAll, 120000);
      return () => clearInterval(interval);
    }
  }, [initialized]);

  const searchSymbols = async (query: string) => {
    return marketDataService.searchSymbols(query);
  };

  const getQuote = async (symbol: string) => {
    return marketDataService.getQuote(symbol);
  };

  const value: MultiSourceMarketContextType = {
    initialized,
    globalMetrics,
    marketIndices,
    topRankings,
    trendingCoins,
    marketNews,
    sectorPerformance,
    sourceHealth: marketDataService.getSourceHealth(),
    searchSymbols,
    getQuote,
    refreshAll,
  };

  return (
    <MultiSourceMarketContext.Provider value={value}>
      {children}
    </MultiSourceMarketContext.Provider>
  );
};

export const useMultiSourceMarket = () => {
  const context = useContext(MultiSourceMarketContext);
  if (!context) {
    throw new Error('useMultiSourceMarket must be used within a MultiSourceMarketProvider');
  }
  return context;
};