import { useState, useEffect } from 'react';
import { fetchHistoricalData } from '@/services/finnhubApi';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '@/utils/technicalIndicators';

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

interface ChartData {
  timestamps: number[];
  prices: number[];
  volumes: number[];
  indicators: {
    sma20?: number[];
    sma50?: number[];
    ema12?: number[];
    ema26?: number[];
    rsi?: number;
    macd?: any;
    bollinger?: any[];
  };
}

export const useChartData = (symbol: string, timeframe: Timeframe = '1M') => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Map timeframe to days and resolution
        const timeframeMap: Record<Timeframe, { days: number; resolution: 'D' | 'W' | 'M' }> = {
          '1D': { days: 1, resolution: 'D' },
          '1W': { days: 7, resolution: 'D' },
          '1M': { days: 30, resolution: 'D' },
          '3M': { days: 90, resolution: 'D' },
          '6M': { days: 180, resolution: 'W' },
          '1Y': { days: 365, resolution: 'W' }
        };
        
        const { days, resolution } = timeframeMap[timeframe];
        const data = await fetchHistoricalData(symbol, resolution, days);
        
        // Calculate technical indicators
        const sma20 = calculateSMA(data.c, 20);
        const sma50 = calculateSMA(data.c, 50);
        const ema12 = calculateEMA(data.c, 12);
        const ema26 = calculateEMA(data.c, 26);
        const rsi = calculateRSI(data.c);
        const macd = calculateMACD(data.c);
        const bollinger = calculateBollingerBands(data.c);
        
        setChartData({
          timestamps: data.t,
          prices: data.c,
          volumes: data.v,
          indicators: {
            sma20,
            sma50,
            ema12,
            ema26,
            rsi,
            macd,
            bollinger
          }
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [symbol, timeframe]);

  return { chartData, loading, error };
};
