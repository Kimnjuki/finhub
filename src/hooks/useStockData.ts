import { useState, useEffect } from 'react';
import { Stock, TradingSignal } from '@/types/stock.types';
import { fetchRealTimeQuote } from '@/services/finnhubApi';
import { calculateTradingSignal } from '@/services/stockApi';

export const useStockData = (symbol: string) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        const stockData = await fetchRealTimeQuote(symbol);
        setStock(stockData);
        
        const tradingSignal = calculateTradingSignal(stockData);
        setSignal(tradingSignal);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStockData, 30000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  return { stock, signal, loading, error };
};
