import React, { useEffect, useState } from 'react';

interface OrderBookDepthProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
}

export function OrderBookDepth({ symbol, size = 'medium' }: OrderBookDepthProps) {
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });
  const [instrument, setInstrument] = useState<any | null>(null);

  // Simulate fetching instrument data
  useEffect(() => {
    const mockInstrument = { symbol, name: 'Bitcoin' };
    setInstrument(mockInstrument);
  }, [symbol]);

  // Simulate order book updates
  useEffect(() => {
    if (!instrument) return;
    
    const updateInterval = setInterval(() => {
      const bids: any[] = [];
      const asks: any[] = [];
      
      // Generate some mock data
      for (let i = 0; i < 10; i++) {
        bids.push({ price: 42000 + i * 10, size: Math.random() * 10 });
        asks.push({ price: 42010 + i * 10, size: Math.random() * 10 });
      }
      
      setOrderBook({ bids, asks });
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [instrument]);

  const maxDisplay = 10;
  const topBids = orderBook.bids.slice(0, maxDisplay);
  const topAsks = orderBook.asks.slice(0, maxDisplay);

  return (
    <div className={`order-book-depth ${size}`}>
      <div className="order-book-header">Order Book</div>
      <div className="order-book-container">
        <div className="bid-ask-spread">
          <div className="bid-pane">
            {topBids.map((bid, i) => (
              <div key={i} className="order-row">
                <span className="price">{bid.price.toFixed(2)}</span>
                <span className="size">{bid.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="spread middle">Spread</div>
          <div className="ask-pane">
            {topAsks.map((ask, i) => (
              <div key={i} className="order-row">
                <span className="price">{ask.price.toFixed(2)}</span>
                <span className="size">{ask.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}