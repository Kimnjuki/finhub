import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { marketDataService } from '@/services/marketData';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
  image: string;
  last_updated: string;
}

const CRYPTO_SYMBOLS = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD', 'XRP-USD', 'DOT-USD', 'DOGE-USD'];

// Map CoinGecko-style IDs to common Yahoo/query symbols
const COINGECKO_ID_TO_SYMBOL: Record<string, string> = {
  bitcoin: 'BTC-USD',
  ethereum: 'ETH-USD',
  binancecoin: 'BNB-USD',
  solana: 'SOL-USD',
  cardano: 'ADA-USD',
  ripple: 'XRP-USD',
  polkadot: 'DOT-USD',
  dogecoin: 'DOGE-USD',
};

// Map asset symbols back to CoinGecko-style ids/images for UI compatibility
const COINGECKO_META: Record<string, { id: string; name: string; symbol: string; image: string }> = {
  BTC: { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png' },
  ETH: { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png' },
  BNB: { id: 'binancecoin', name: 'BNB', symbol: 'bnb', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/bnb.png' },
  SOL: { id: 'solana', name: 'Solana', symbol: 'sol', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png' },
  ADA: { id: 'cardano', name: 'Cardano', symbol: 'ada', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/ada.png' },
  XRP: { id: 'ripple', name: 'XRP', symbol: 'xrp', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/xrp.png' },
  DOT: { id: 'polkadot', name: 'Polkadot', symbol: 'dot', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/dot.png' },
  DOGE: { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', image: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/doge.png' },
};

// Generate fallback crypto data from the market data service
async function fetchFallbackCryptoData(): Promise<CryptoAsset[]> {
  try {
    const rankings = await marketDataService.getCryptoRankings(8);
    return rankings.map(r => ({
      id: r.symbol.toLowerCase(),
      symbol: r.symbol.toLowerCase(),
      name: r.name,
      current_price: r.price,
      price_change_24h: r.change24h || 0,
      price_change_percentage_24h: r.change24h || 0,
      market_cap: r.marketCap || 0,
      total_volume: r.volume24h || 0,
      image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${r.symbol.toLowerCase()}.png`,
      last_updated: new Date().toISOString(),
    }));
  } catch {
    // Ultimate fallback: static mock data
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67543, price_change_24h: 234, price_change_percentage_24h: 0.35, market_cap: 1320000000000, total_volume: 35000000000, image: '', last_updated: new Date().toISOString() },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3456, price_change_24h: -12, price_change_percentage_24h: -0.36, market_cap: 415000000000, total_volume: 15000000000, image: '', last_updated: new Date().toISOString() },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145, price_change_24h: 5, price_change_percentage_24h: 3.87, market_cap: 65000000000, total_volume: 5000000000, image: '', last_updated: new Date().toISOString() },
      { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.62, price_change_24h: 0.01, price_change_percentage_24h: 2.01, market_cap: 34000000000, total_volume: 2000000000, image: '', last_updated: new Date().toISOString() },
      { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_24h: -0.02, price_change_percentage_24h: -4.34, market_cap: 16000000000, total_volume: 800000000, image: '', last_updated: new Date().toISOString() },
      { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.23, price_change_24h: 0.34, price_change_percentage_24h: 4.93, market_cap: 9500000000, total_volume: 600000000, image: '', last_updated: new Date().toISOString() },
      { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 585, price_change_24h: 8.50, price_change_percentage_24h: 1.48, market_cap: 90000000000, total_volume: 1500000000, image: '', last_updated: new Date().toISOString() },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_24h: -0.005, price_change_percentage_24h: -4.34, market_cap: 17000000000, total_volume: 1200000000, image: '', last_updated: new Date().toISOString() },
    ];
  }
}

export const useCryptoPrice = () => {
  const { data: cryptoData, isLoading, error, refetch } = useQuery<CryptoAsset[]>({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      try {
        const quotes = await marketDataService.getQuotes(CRYPTO_SYMBOLS, 'crypto');

        const assets: CryptoAsset[] = CRYPTO_SYMBOLS.map(symbol => {
          const quote = quotes.get(symbol);
          const meta = COINGECKO_META[symbol.replace('-USD', '')];
          return {
            id: meta.id,
            symbol: meta.symbol,
            name: meta.name,
            current_price: quote?.price ?? 0,
            price_change_24h: quote?.change ?? 0,
            price_change_percentage_24h: quote?.changePercent ?? 0,
            market_cap: 0,
            total_volume: quote?.volume24h ?? 0,
            image: meta.image,
            last_updated: new Date().toISOString(),
          };
        });

        return assets;
      } catch (err) {
        console.warn('[useCryptoPrice] Unified market data fetch failed, using fallback data:', err);
        return await fetchFallbackCryptoData();
      }
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    retry: 1,
    retryDelay: 10000,
  });

  return {
    cryptoData: cryptoData || [],
    isLoading,
    error,
    refetch,
    wsConnected: false,
  };
};

// Hook for currency conversion
export const useCurrencyConversion = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [conversionRates, setConversionRates] = useState<Record<string, number>>({
    USD: 1,
    KES: 129.5, // Kenyan Shilling
    NGN: 1630, // Nigerian Naira
    ZAR: 18.5, // South African Rand
    GHS: 15.8, // Ghanaian Cedi
    EUR: 0.92,
    GBP: 0.79,
  });

  const convertPrice = useCallback((priceUSD: number) => {
    return priceUSD * (conversionRates[selectedCurrency] || 1);
  }, [selectedCurrency, conversionRates]);

  const getCurrencySymbol = useCallback((currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      KES: 'KSh',
      NGN: '₦',
      ZAR: 'R',
      GHS: 'GH₵',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || currency;
  }, []);

  return {
    selectedCurrency,
    setSelectedCurrency,
    conversionRates,
    convertPrice,
    getCurrencySymbol,
  };
};