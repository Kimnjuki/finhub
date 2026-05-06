import React, { createContext, useContext, ReactNode } from 'react';
import { useCryptoPrice, useCurrencyConversion } from '@/hooks/useCryptoPrice';
import type { CryptoAsset } from '@/hooks/useCryptoPrice';

interface MarketDataContextType {
  cryptoData: CryptoAsset[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  wsConnected: boolean;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  convertPrice: (priceUSD: number) => number;
  getCurrencySymbol: (currency: string) => string;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { cryptoData, isLoading, error, refetch, wsConnected } = useCryptoPrice();
  const { selectedCurrency, setSelectedCurrency, convertPrice, getCurrencySymbol } = useCurrencyConversion();

  const value: MarketDataContextType = {
    cryptoData,
    isLoading,
    error,
    refetch,
    wsConnected,
    selectedCurrency,
    setSelectedCurrency,
    convertPrice,
    getCurrencySymbol,
  };

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};
