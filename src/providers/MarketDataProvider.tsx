import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryMarketStreams, queryMarketInstruments, streamMarketData } from '../../convex/queries/helpers';

const MarketDataContext = createContext<{
  instruments: any[];
  streams: any[];
  subscribe: (symbol: string, channels: string[]) => void;
  unsubscribe: (symbol: string, channels: string[]) => void;
  loading: boolean;
} | null>(null);

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const { data: instruments, isLoading: instrumentsLoading } = useQuery({
    queryKey: ['marketInstruments'],
    queryFn: () => queryMarketInstruments(),
    enabled: true,
  });

  const { data: streams, isLoading: streamsLoading } = useQuery({
    queryKey: ['marketStreams'],
    queryFn: () => queryMarketStreams(),
    enabled: true,
  });

  const [subscriptions, setSubscriptions] = useState<{ [key: string]: string[] }>({});

  const subscribe = (symbol: string, channels: string[]) => {
    // TODO: Implement WebSocket subscription logic
    console.log(`Subscribing ${symbol} to channels:`, channels);
    setSubscriptions((prev) => {
      return {
        ...prev,
        [symbol]: channels,
      };
    });
  };

  const unsubscribe = (symbol: string, channels: string[]) => {
    // TODO: Unsubscribe from WebSocket channels
    console.log(`Unsubscribing ${symbol} from channels:`, channels);
    setSubscriptions((prev) => {
      const newSubs = { ...prev };
      delete newSubs[symbol];
      return newSubs;
    });
  };

  return (
    <MarketDataContext.Provider value={{
      instruments: instruments?.data || [],
      streams: streams?.data || [],
      subscribe,
      unsubscribe,
      loading: instrumentsLoading || streamsLoading,
    }}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}