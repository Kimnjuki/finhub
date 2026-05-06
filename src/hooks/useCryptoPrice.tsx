import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

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

interface WebSocketPrice {
  [key: string]: number;
}

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano', 'ripple', 'polkadot', 'dogecoin'];

export const useCryptoPrice = () => {
  const [wsConnected, setWsConnected] = useState(false);
  const [livePrices, setLivePrices] = useState<WebSocketPrice>({});

  // Fetch detailed crypto data with sparklines
  const { data: cryptoData, isLoading, error, refetch } = useQuery<CryptoAsset[]>({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(',')}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
      );
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // WebSocket connection for real-time price updates
  useEffect(() => {
    const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,binancecoin,solana,cardano,ripple,polkadot,dogecoin');

    ws.onopen = () => {
      console.log('WebSocket connected for real-time prices');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketPrice = JSON.parse(event.data);
        setLivePrices(prevPrices => ({
          ...prevPrices,
          ...data
        }));
      } catch (err) {
        console.error('Error parsing WebSocket data:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Merge API data with live WebSocket prices
  const mergedData = cryptoData?.map(crypto => {
    const wsPrice = livePrices[crypto.id];
    return {
      ...crypto,
      current_price: wsPrice ? parseFloat(wsPrice.toString()) : crypto.current_price,
    };
  });

  return {
    cryptoData: mergedData,
    isLoading,
    error,
    refetch,
    wsConnected,
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
