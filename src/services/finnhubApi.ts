import { Stock } from '@/types/stock.types';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';

// Determine if we're in dev mode (localhost) for proxy routing
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Build the appropriate URL - use Vite proxy in dev to avoid CORS
function buildFinnhubUrl(path: string): string {
  if (isDev) {
    return `/api/finnhub${path}`;
  }
  return `https://finnhub.io/api/v1${path}`;
}

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

// Generate mock stock data when API is unavailable
function getMockStock(symbol: string): Stock {
  const mockPrices: Record<string, { price: number; change: number; changePercent: number; name: string; sector: string }> = {
    'AAPL': { price: 198.50, change: 1.25, changePercent: 0.63, name: 'Apple Inc.', sector: 'Technology' },
    'GOOGL': { price: 175.80, change: -0.45, changePercent: -0.26, name: 'Alphabet Inc.', sector: 'Technology' },
    'MSFT': { price: 425.30, change: 3.20, changePercent: 0.76, name: 'Microsoft Corporation', sector: 'Technology' },
    'AMZN': { price: 185.90, change: 2.10, changePercent: 1.14, name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
    'NVDA': { price: 880.40, change: 15.60, changePercent: 1.80, name: 'NVIDIA Corporation', sector: 'Technology' },
    'META': { price: 510.20, change: -2.30, changePercent: -0.45, name: 'Meta Platforms Inc.', sector: 'Technology' },
    'TSLA': { price: 245.60, change: -5.40, changePercent: -2.15, name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
    'JPM': { price: 198.30, change: 0.80, changePercent: 0.40, name: 'JPMorgan Chase & Co.', sector: 'Financial' },
    'V': { price: 285.40, change: 1.10, changePercent: 0.39, name: 'Visa Inc.', sector: 'Financial' },
    'WMT': { price: 172.80, change: 0.90, changePercent: 0.52, name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  };
  
  const mock = mockPrices[symbol.toUpperCase()];
  if (mock) {
    return {
      symbol: symbol.toUpperCase(),
      name: mock.name,
      price: mock.price,
      change: mock.change,
      changePercent: mock.changePercent,
      volume: Math.round(10000000 + Math.random() * 50000000),
      marketCap: mock.price * 1000000000,
      peRatio: 25 + Math.random() * 10,
      week52High: mock.price * 1.15,
      week52Low: mock.price * 0.85,
      sector: mock.sector,
    };
  }
  
  // Generic mock for unknown symbols
  const price = 50 + Math.random() * 200;
  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price,
    change: (Math.random() - 0.5) * 5,
    changePercent: (Math.random() - 0.5) * 3,
    volume: Math.round(5000000 + Math.random() * 20000000),
    marketCap: price * 500000000,
    peRatio: 20 + Math.random() * 15,
    week52High: price * 1.15,
    week52Low: price * 0.85,
    sector: 'Unknown',
  };
}

export const fetchRealTimeQuote = async (symbol: string): Promise<Stock> => {
  try {
    // Use demo key with proxy route in dev, or real key in production
    const url = buildFinnhubUrl(`/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    const quoteResponse = await rateLimitedFetch(url);
    
    if (!quoteResponse.ok) {
      console.warn(`[Finnhub] API returned ${quoteResponse.status} for ${symbol}, using mock data`);
      return getMockStock(symbol);
    }
    
    const quoteData = await quoteResponse.json();
    
    // Try to fetch company profile
    const profileUrl = buildFinnhubUrl(`/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    const profileResponse = await rateLimitedFetch(profileUrl);
    let profileData: any = {};
    if (profileResponse.ok) {
      profileData = await profileResponse.json();
    }
    
    if (!quoteData.c || quoteData.c === 0) {
      console.warn(`[Finnhub] Invalid quote data for ${symbol}, using mock data`);
      return getMockStock(symbol);
    }
    
    return {
      symbol: symbol,
      name: profileData.name || symbol,
      price: quoteData.c, // Current price
      change: quoteData.d, // Change
      changePercent: quoteData.dp, // Percent change
      volume: profileData.shareOutstanding || 0,
      marketCap: (profileData.marketCapitalization || 0) * 1000000 || 0,
      peRatio: 0, // Not in free tier
      week52High: quoteData.h || quoteData.c * 1.2,
      week52Low: quoteData.l || quoteData.c * 0.8,
      sector: profileData.finnhubIndustry || 'Unknown'
    };
  } catch (error) {
    console.warn(`[Finnhub] Error fetching data for ${symbol}, using mock data:`, error);
    return getMockStock(symbol);
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
    
    const url = buildFinnhubUrl(`/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub returned ${response.status}`);
    }
    
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
    console.warn(`[Finnhub] Error fetching historical data for ${symbol}:`, error);
    // Generate mock historical data
    const days = daysBack;
    const basePrice = 100 + Math.random() * 200;
    const timestamps: number[] = [];
    const closes: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const opens: number[] = [];
    const volumes: number[] = [];
    
    const now = Math.floor(Date.now() / 1000);
    let prevClose = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const ts = now - (i * 24 * 60 * 60);
      const change = (Math.random() - 0.5) * basePrice * 0.05;
      const open = prevClose;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      timestamps.push(ts);
      opens.push(open);
      closes.push(close);
      highs.push(high);
      lows.push(low);
      volumes.push(Math.round(5000000 + Math.random() * 30000000));
      
      prevClose = close;
    }
    
    return {
      t: timestamps,
      c: closes,
      h: highs,
      l: lows,
      o: opens,
      v: volumes,
    };
  }
};

