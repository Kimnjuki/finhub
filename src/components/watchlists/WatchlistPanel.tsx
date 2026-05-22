import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface WatchlistPanelProps {
  symbols?: string[];
}

export function WatchlistPanel({ symbols }: WatchlistPanelProps) {
  const { streams } = useMarketData();
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Filter for watchlist updates
    const watchlistStream = streams.find(
      (s: any) => s.channel === 'watchlist_updates' && symbols?.some(sym => s.instrumentId?.includes(sym))
    );

    if (watchlistStream) {
      setWatchlists([watchlistStream.payload]);
    }
  }, [streams, symbols]);

  return (
    <div className="watchlist-panel">
      <h3>Watchlists</h3>
      <div className="watchlist-items">
        {watchlists.length === 0 ? (
          <p>No watchlists</p>
        ) : (
          watchlists.map((list: any, index) => (
            <div key={index} className="watchlist-item">
              <div className="watchlist-name">{list.name}</div>
              <div className="watchlist-items-count">{list.items?.length || 0} items</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}