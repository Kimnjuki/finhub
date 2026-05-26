import { useState, useEffect, useCallback, useRef } from 'react';
import { marketDataService } from '../unified/MarketDataService';
import { AggregatedQuote, AssetClass, NewsItem, CryptoRanking, GlobalMarketMetrics, MarketIndex, SectorPerformance, CompanyFundamentals } from '../types';

/**
 * Hook for multi-source aggregated price data
 */
export function useMultiSourcePrice(symbol: string, assetClass: AssetClass = 'crypto') {
  const [quote, setQuote] = useState<AggregatedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchQuote = useCallback(async () => {
    try {
      const result = await marketDataService.getQuote(symbol, assetClass);
      if (result) {
        setQuote(result);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  }, [symbol, assetClass]);

  useEffect(() => {
    setLoading(true);
    fetchQuote();

    // Refresh every 15 seconds
    intervalRef.current = setInterval(fetchQuote, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQuote]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    marketDataService.subscribeToSymbol(symbol, assetClass);
    return () => marketDataService.unsubscribeFromSymbol(symbol);
  }, [symbol, assetClass]);

  return { quote, loading, error, refetch: fetchQuote };
}

/**
 * Hook for multiple symbols
 */
export function useMultiSourcePrices(symbols: string[], assetClass: AssetClass = 'crypto') {
  const [quotes, setQuotes] = useState<Map<string, AggregatedQuote>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchAll = async () => {
      const results = await marketDataService.getQuotes(symbols, assetClass);
      if (mounted) {
        setQuotes(results);
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbols.join(','), assetClass]);

  return { quotes, loading };
}

/**
 * Hook for crypto rankings (CoinMarketCap)
 */
export function useCryptoRankings(limit: number = 50) {
  const [rankings, setRankings] = useState<CryptoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetch = async () => {
      const data = await marketDataService.getCryptoRankings(limit);
      if (mounted) {
        setRankings(data);
        setLoading(false);
      }
    };

    fetch();
    const interval = setInterval(fetch, 60000); // Refresh every minute
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  return { rankings, loading };
}

/**
 * Hook for global market metrics
 */
export function useGlobalMarketMetrics() {
  const [metrics, setMetrics] = useState<GlobalMarketMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      const data = await marketDataService.getGlobalMetrics();
      if (mounted) {
        setMetrics(data);
        setLoading(false);
      }
    };

    fetch();
    const interval = setInterval(fetch, 120000); // Every 2 minutes
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { metrics, loading };
}

/**
 * Hook for market indices
 */
export function useMarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      const data = await marketDataService.getMarketIndices();
      if (mounted) {
        setIndices(data);
        setLoading(false);
      }
    };

    fetch();
    const interval = setInterval(fetch, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { indices, loading };
}

/**
 * Hook for aggregated market news
 */
export function useMarketNews(symbols?: string[], limit: number = 20) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      const data = await marketDataService.getMarketNews(symbols, limit);
      if (mounted) {
        setNews(data);
        setLoading(false);
      }
    };

    fetch();
    const interval = setInterval(fetch, 300000); // Every 5 minutes
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbols?.join(','), limit]);

  return { news, loading };
}

/**
 * Hook for sector performance
 */
export function useSectorPerformance() {
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      const data = await marketDataService.getSectorPerformance();
      if (mounted) {
        setSectors(data);
        setLoading(false);
      }
    };

    fetch();
    const interval = setInterval(fetch, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { sectors, loading };
}

/**
 * Hook for company fundamentals
 */
export function useFundamentals(symbol: string) {
  const [fundamentals, setFundamentals] = useState<CompanyFundamentals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);

    const fetch = async () => {
      const data = await marketDataService.getFundamentals(symbol);
      setFundamentals(data);
      setLoading(false);
    };

    fetch();
  }, [symbol]);

  return { fundamentals, loading };
}

/**
 * Hook for trending coins
 */
export function useTrendingCoins(limit: number = 10) {
  const [coins, setCoins] = useState<CryptoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await marketDataService.getTrendingCoins(limit);
      setCoins(data);
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 300000);
    return () => clearInterval(interval);
  }, [limit]);

  return { coins, loading };
}

/**
 * Hook for gainers and losers
 */
export function useGainersLosers(limit: number = 10) {
  const [gainers, setGainers] = useState<CryptoRanking[]>([]);
  const [losers, setLosers] = useState<CryptoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await marketDataService.getGainersLosers(limit);
      setGainers(data.gainers);
      setLosers(data.losers);
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [limit]);

  return { gainers, losers, loading };
}