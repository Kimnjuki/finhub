import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyRates } from '@/hooks/useCurrencyRates';
import { useCryptoPrice, type CryptoAsset } from '@/hooks/useCryptoPrice';
import {
  analyzeCryptoWithNvidia,
  analyzeCurrencyWithNvidia,
  getMarketSentimentFromNvidia,
  type CryptoAnalysisResponse,
  type CurrencyAnalysisResponse,
  type MarketSentimentResponse,
} from '@/services/nvidiaService';

export interface NvidiaAIState {
  cryptoAnalysis: Record<string, CryptoAnalysisResponse>;
  currencyAnalysis: Record<string, CurrencyAnalysisResponse>;
  marketSentiment: MarketSentimentResponse | null;
  loading: Record<string, boolean>;
  error: string | null;
}

/**
 * Hook that connects Nvidia AI to real-time crypto and currency data
 */
export const useNvidiaAI = () => {
  const { cryptoData, isLoading: cryptoLoading } = useCryptoPrice();
  const { rates: currencyRates, loading: currencyLoading } = useCurrencyRates();
  const { toast } = useToast();

  const [cryptoAnalysis, setCryptoAnalysis] = useState<Record<string, CryptoAnalysisResponse>>({});
  const [currencyAnalysis, setCurrencyAnalysis] = useState<Record<string, CurrencyAnalysisResponse>>({});
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentResponse | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const lastAutoRefresh = useRef<number>(0);
  const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

  /**
   * Analyze a single cryptocurrency using Nvidia AI with real-time data
   */
  const analyzeCrypto = useCallback(async (crypto: CryptoAsset) => {
    const key = `crypto-${crypto.id}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError(null);

    try {
      const result = await analyzeCryptoWithNvidia({
        symbol: crypto.symbol.toUpperCase(),
        name: crypto.name,
        currentPrice: crypto.current_price,
        priceChange24h: crypto.price_change_percentage_24h || 0,
        volume: crypto.total_volume || 0,
        marketCap: crypto.market_cap || 0,
        sparkline: crypto.sparkline_in_7d?.price,
      });

      setCryptoAnalysis((prev) => ({ ...prev, [key]: result }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze crypto';
      setError(errorMessage);
      toast({
        title: 'Nvidia AI Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, [toast]);

  /**
   * Analyze the top N cryptocurrencies automatically
   */
  const analyzeTopCryptos = useCallback(async (count: number = 3) => {
    if (!cryptoData || cryptoData.length === 0) return;

    const topN = cryptoData.slice(0, count);
    const results: Record<string, CryptoAnalysisResponse> = {};

    for (const crypto of topN) {
      const key = `crypto-${crypto.id}`;
      setLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const result = await analyzeCryptoWithNvidia({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          currentPrice: crypto.current_price,
          priceChange24h: crypto.price_change_percentage_24h || 0,
          volume: crypto.total_volume || 0,
          marketCap: crypto.market_cap || 0,
          sparkline: crypto.sparkline_in_7d?.price,
        });
        results[key] = result;
        setCryptoAnalysis((prev) => ({ ...prev, [key]: result }));
      } catch (err) {
        console.error(`Failed to analyze ${crypto.name}:`, err);
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    }

    return results;
  }, [cryptoData]);

  /**
   * Analyze a currency pair using Nvidia AI with real-time rates
   */
  const analyzeCurrency = useCallback(async (baseCurrency: string, targetCurrency: string) => {
    const key = `forex-${baseCurrency}-${targetCurrency}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError(null);

    try {
      const baseRate = currencyRates[baseCurrency] || 1;
      const targetRate = currencyRates[targetCurrency] || 1;
      const currentRate = baseRate / targetRate;

      const result = await analyzeCurrencyWithNvidia({
        baseCurrency,
        targetCurrency,
        currentRate,
        change24h: ((Math.random() - 0.5) * 2), // Simulated 24h change
      });

      setCurrencyAnalysis((prev) => ({ ...prev, [key]: result }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze currency';
      setError(errorMessage);
      toast({
        title: 'Currency Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, [currencyRates, toast]);

  /**
   * Analyze major African currency pairs
   */
  const analyzeAfricanCurrencyPairs = useCallback(async () => {
    const pairs = [
      ['USD', 'KES'], ['USD', 'NGN'], ['USD', 'ZAR'],
      ['USD', 'GHS'], ['USD', 'EUR'], ['USD', 'GBP'],
    ];

    const results: Record<string, CurrencyAnalysisResponse> = {};
    for (const [base, target] of pairs) {
      const key = `forex-${base}-${target}`;
      try {
        setLoading((prev) => ({ ...prev, [key]: true }));
        const baseRate = currencyRates[base] || 1;
        const targetRate = currencyRates[target] || 1;
        const currentRate = baseRate / targetRate;

        const result = await analyzeCurrencyWithNvidia({
          baseCurrency: base,
          targetCurrency: target,
          currentRate,
          change24h: ((Math.random() - 0.5) * 2),
        });
        results[key] = result;
        setCurrencyAnalysis((prev) => ({ ...prev, [key]: result }));
      } catch (err) {
        console.error(`Failed to analyze ${base}/${target}:`, err);
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    }
    return results;
  }, [currencyRates]);

  /**
   * Get real-time market sentiment analysis from Nvidia AI
   */
  const refreshMarketSentiment = useCallback(async () => {
    const key = 'market-sentiment';
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError(null);

    try {
      // Extract crypto prices from the existing data
      const cryptoPrices: Record<string, number> = {};
      if (cryptoData) {
        for (const c of cryptoData) {
          cryptoPrices[c.symbol] = c.current_price;
        }
      }

      const result = await getMarketSentimentFromNvidia(cryptoPrices, currencyRates);
      setMarketSentiment(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get market sentiment';
      setError(errorMessage);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, [cryptoData, currencyRates]);

  /**
   * Auto-analyze top cryptos and forex pairs on a schedule
   */
  useEffect(() => {
    if (!cryptoData || cryptoData.length === 0) return;
    if (Object.keys(currencyRates).length === 0) return;

    const shouldAutoRefresh = Date.now() - lastAutoRefresh.current > AUTO_REFRESH_INTERVAL;
    if (shouldAutoRefresh && Object.keys(cryptoAnalysis).length === 0) {
      lastAutoRefresh.current = Date.now();
      analyzeTopCryptos(3);
      analyzeAfricanCurrencyPairs();
      refreshMarketSentiment();
    }
  }, [cryptoData, currencyRates]); // Only run on initial data load

  const isLoading = useCallback((key: string) => loading[key] || false, [loading]);

  return {
    // Analysis results
    cryptoAnalysis,
    currencyAnalysis,
    marketSentiment,

    // Actions
    analyzeCrypto,
    analyzeTopCryptos,
    analyzeCurrency,
    analyzeAfricanCurrencyPairs,
    refreshMarketSentiment,

    // State
    isLoading,
    loading,
    error,
    isCryptoDataReady: !cryptoLoading && !!cryptoData,
    isCurrencyDataReady: !currencyLoading && Object.keys(currencyRates).length > 0,
  };
};