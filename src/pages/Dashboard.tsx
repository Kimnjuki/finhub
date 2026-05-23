import React, { useEffect, useState } from 'react';
import { useMarketData } from '../contexts/MarketDataContext';
import { InstrumentTicker } from '../components/market/InstrumentTicker';
import { OrderBookDepth } from '../components/market/OrderBookDepth';
import { CandlestickChart } from '../components/charts/CandlestickChart';
import { AlertManager } from '../components/alerts/AlertManager';
import { SignalFeed } from '../components/signals/SignalFeed';
import { EventCalendar } from '../components/events/EventCalendar';
import { WatchlistPanel } from '../components/watchlists/WatchlistPanel';
import { StreamHealthMonitor } from '../components/admin/StreamHealthMonitor';
import { MarketTabs } from '../components/markets/MarketTabs';

interface DashboardProps {
  initialSymbols?: string[];
}

export default function Dashboard({ initialSymbols }: DashboardProps) {


    const { cryptoData, isLoading } = useMarketData();
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(initialSymbols || []);

  useEffect(() => {
    if (initialSymbols && initialSymbols.length > 0) {
      setSelectedSymbols(initialSymbols);
    }
  }, [initialSymbols]);

  const handleSymbolChange = (symbol: string) => {
    if (!selectedSymbols.includes(symbol)) {
      setSelectedSymbols(prev => [...prev, symbol]);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Trading Dashboard</h1>
        <MarketTabs symbols={selectedSymbols} onSymbolChange={handleSymbolChange} />
      </div>

      <div className="grid-layout">
        <div className="left-col">
          <div className="card">
            <h3>Market Overview</h3>
            {selectedSymbols.map((symbol) => (
              <InstrumentTicker key={symbol} symbol={symbol} size="small" />
            ))}
          </div>

          <div className="card">
            <h3>Order Book</h3>
            {selectedSymbols.map((symbol) => (
              <OrderBookDepth key={symbol} symbol={symbol} size="medium" />
            ))}
          </div>
        </div>

        <div className="center-col">
          <div className="card chart-card">
            <h3>Price Chart</h3>
            {selectedSymbols.map((symbol) => (
              <CandlestickChart
                key={symbol}
                symbol={symbol}
                interval="1h"
                width={800}
                height={400}
              />
            ))}
          </div>

          <div className="card alerts-card">
            <AlertManager symbols={selectedSymbols} />
          </div>

          <div className="card signals-card">
            <SignalFeed symbols={selectedSymbols} />
          </div>
        </div>

        <div className="right-col">
          <div className="card events-card">
            <EventCalendar symbols={selectedSymbols} />
          </div>

          <div className="card watchlist-card">
            <WatchlistPanel symbols={selectedSymbols} />
          </div>

          <div className="card health-card">
            <StreamHealthMonitor symbols={selectedSymbols} />
          </div>
        </div>
      </div>
    </div>
  );
}