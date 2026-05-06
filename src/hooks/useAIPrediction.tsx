import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { CryptoAsset } from './useCryptoPrice';

export interface AIPrediction {
  predicted_price: number;
  confidence_level: number;
  price_range: { low: number; high: number };
  contributing_factors: string[];
  risk_level: 'low' | 'medium' | 'high';
  analysis_summary: string;
  symbol: string;
  name: string;
  timeframe: string;
  current_price: number;
  timestamp: string;
  technical_indicators?: {
    rsi: number;
    sma7: number;
    sma30: number;
    volatility: number;
    momentum: number;
  };
}

const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_URL as string;

export const useAIPrediction = () => {
  const [predictions, setPredictions] = useState<Record<string, AIPrediction>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePrediction = async (
    crypto: CryptoAsset,
    timeframe: '24h' | '7d' | '30d' = '24h'
  ) => {
    const key = `${crypto.symbol}-${timeframe}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError(null);

    try {
      // Call the Convex HTTP action for AI predictions
      const response = await fetch(`${CONVEX_SITE_URL}/ai-price-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          currentPrice: crypto.current_price,
          priceData: crypto.sparkline_in_7d?.price || [],
          volume: crypto.total_volume,
          priceChange24h: crypto.price_change_percentage_24h,
          marketCap: crypto.market_cap,
          timeframe,
        }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPredictions((prev) => ({ ...prev, [key]: data }));
      toast({
        title: 'Prediction Generated',
        description: `AI analyzed ${crypto.name} for ${timeframe} forecast`,
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prediction';
      setError(errorMessage);
      toast({ title: 'Prediction Failed', description: errorMessage, variant: 'destructive' });
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getPrediction = (symbol: string, timeframe: string) =>
    predictions[`${symbol}-${timeframe}`];

  const isLoading = (symbol: string, timeframe: string) =>
    loading[`${symbol}-${timeframe}`] || false;

  return { predictions, loading, error, generatePrediction, getPrediction, isLoading };
};
