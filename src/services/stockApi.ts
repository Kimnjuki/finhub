import { Stock, TradingSignal } from '@/types/stock.types';

// Mock function - Replace with real API integration
export const fetchStockData = async (symbol: string): Promise<Stock> => {
  // For demo purposes, generating mock data
  // In production, use Alpha Vantage, Finnhub, or Yahoo Finance API
  
  const basePrice = Math.random() * 500 + 50;
  const change = (Math.random() - 0.5) * 20;
  
  return {
    symbol,
    name: symbol,
    price: basePrice,
    change: change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
    peRatio: Math.random() * 50 + 10,
    week52High: basePrice + Math.random() * 50,
    week52Low: basePrice - Math.random() * 50,
    sector: 'Technology'
  };
};

export const calculateTradingSignal = (stock: Stock): TradingSignal => {
  // Simple RSI-based signal calculation
  const rsi = Math.random() * 100;
  
  let type: 'buy' | 'sell' | 'hold';
  let strength: 'strong' | 'moderate' | 'weak';
  let recommendation: string;
  
  if (rsi < 30) {
    type = 'buy';
    strength = rsi < 20 ? 'strong' : 'moderate';
    recommendation = 'Stock is oversold. Good buying opportunity.';
  } else if (rsi > 70) {
    type = 'sell';
    strength = rsi > 80 ? 'strong' : 'moderate';
    recommendation = 'Stock is overbought. Consider taking profits.';
  } else {
    type = 'hold';
    strength = 'moderate';
    recommendation = 'Stock is in neutral zone. Monitor for breakout.';
  }
  
  return {
    type,
    strength,
    indicators: {
      rsi: rsi,
      macd: stock.change > 0 ? 'Bullish' : 'Bearish',
      movingAverage: stock.changePercent > 0 ? 'Above MA' : 'Below MA',
      volume: stock.volume > 5000000 ? 'High' : 'Normal'
    },
    recommendation
  };
};

// API Configuration for real implementation
export const API_CONFIG = {
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: 'YOUR_API_KEY_HERE',
    endpoints: {
      quote: 'GLOBAL_QUOTE',
      timeSeries: 'TIME_SERIES_DAILY'
    }
  },
  finnhub: {
    baseUrl: 'https://finnhub.io/api/v1',
    apiKey: 'YOUR_API_KEY_HERE',
    endpoints: {
      quote: '/quote',
      profile: '/stock/profile2'
    }
  }
};
