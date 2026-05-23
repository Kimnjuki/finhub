import React, { useEffect, useState } from 'react';

interface WatchlistPanelProps {
  symbols?: string[];
}

export function WatchlistPanel({ symbols }: WatchlistPanelProps) {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching watchlists data
  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        const mockWatchlists = [
          {
            name: 'Crypto Portfolio',
            items: [
              { symbol: 'BTC-USD', price: 42000, change24h: 1.5 },
              { symbol: 'ETH-USD', price: 2400, change24h: -0.5 },
              { symbol: 'SOL-USD', price: 100, change24h: 2.3 },
            ],
          },
          {
            name: 'Tech Stocks',
            items: [
              { symbol: 'AAPL', price: 175, change24h: 0.8 },
              { symbol: 'GOOGL', price: 140, change24h: -1.2 },
              { symbol: 'MSFT', price: 330, change24h: 0.5 },
            ],
          },
        ];
        setWatchlists(mockWatchlists);
        setIsLoading(false);
      }
    }, 1000);
    
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <div>Loading watchlists...</div>;
  }

  return (
    <div className="watchlist-panel">
      <h3>Watchlists</h3>
      {watchlists.length === 0 ? (
        <p>No watchlists</p>
      ) : (
        <div className="watchlist-items">
          {watchlists.map((watchlist: any, index) => (
            <div key={index} className="watchlist-item">
              <div className="watchlist-name">{watchlist.name}</div>
              <div className="watchlist-items">
                {watchlist.items.map((item: any, idx: number) => (
                  <div key={idx} className="watchlist-item-symbol">
                    {item.symbol}: ${item.price.toFixed(2)} ({item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(2)}%)
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}