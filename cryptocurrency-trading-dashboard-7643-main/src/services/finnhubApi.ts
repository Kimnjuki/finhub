import { Stock } from '@/types/stock.types';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';

// Rate limiting helper
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 1100; // Slightly over 1 second to stay under 60/min

const rateLimitedFetch = async (url: string) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
  return fetch(url);
};

export const fetchRealTimeQuote = async (symbol: string): Promise<Stock> => {
  try {
    // Fetch quote
    const quoteResponse = await rateLimitedFetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const quoteData = await quoteResponse.json();
    
    // Fetch company profile
    const profileResponse = await rateLimitedFetch(
      `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const profileData = await profileResponse.json();
    
    if (!quoteData.c || quoteData.c === 0) {
      throw new Error('Invalid quote data');
    }
    
    return {
      symbol: symbol,
      name: profileData.name || symbol,
      price: quoteData.c, // Current price
      change: quoteData.d, // Change
      changePercent: quoteData.dp, // Percent change
      volume: profileData.shareOutstanding || 0,
      marketCap: profileData.marketCapitalization * 1000000 || 0,
      peRatio: 0, // Not in free tier
      week52High: quoteData.h || quoteData.c * 1.2,
      week52Low: quoteData.l || quoteData.c * 0.8,
      sector: profileData.finnhubIndustry || 'Unknown'
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const fetchHistoricalData = async (
  symbol: string,
  resolution: 'D' | 'W' | 'M' = 'D',
  daysBack: number = 30
): Promise<{ t: number[]; c: number[]; h: number[]; l: number[]; o: number[]; v: number[] }> => {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (daysBack * 24 * 60 * 60);
    
    const response = await rateLimitedFetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.s === 'no_data') {
      throw new Error('No historical data available');
    }
    
    return {
      t: data.t, // Timestamps
      c: data.c, // Close prices
      h: data.h, // High prices
      l: data.l, // Low prices
      o: data.o, // Open prices
      v: data.v  // Volumes
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
};
