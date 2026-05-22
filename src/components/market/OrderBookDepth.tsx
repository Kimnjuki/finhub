import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface OrderBookDepthProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
}

export function OrderBookDepth({ symbol, size = 'medium' }: OrderBookDepthProps) {
  const { streams } = useMarketData();
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });
  
  useEffect(() => {
    if (!streams) return;

    // Find the latest order book snapshot for this instrument
    const orderBookData = streams.find(
      (s: any) => s.channel === 'orderbook_l2' && s.instrumentId === symbol
    );

    if (orderBookData && orderBookData.payload) {
      // Parse order book data - format depends on exchange
      let bids: any[] = [];
      let asks: any[] = [];

      if (Array.isArray(orderBookData.payload.bids)) {
        bids = orderBookData.payload.bids.map((bid: any) => ({
          price: parseFloat(bid.p),
          size: parseFloat(bid.q),
        }));
      } else if (Array.isArray(orderBookData.payload.bids[0])) {
        // Handle different format
        bids = orderBookData.payload.bids.map((bid: any) => ({
          price: parseFloat(bid[0]),
          size: parseFloat(bid[1]),
        }));
      }

      if (Array.isArray(orderBookData.payload.asks)) {
        asks = orderBookData.payload.asks.map((ask: any) => ({
          price: parseFloat(ask.p),
          size: parseFloat(ask.q),
        }));
      } else if (Array.isArray(orderBookData.payload.asks[0])) {
        asks = orderBookData.payload.asks.map((ask: any) => ({
          price: parseFloat(ask[0]),
          size: parseFloat(ask[1]),
        }));
      }

      setOrderBook({ bids, asks });
    }
  }, [streams, symbol]);

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
                <span className="price">{bid.price.toFixed(4)}</span>
                <span className="size">{bid.size.toFixed(4)}</span>
              </div>
            ))}
          </div>
          <div className="spread middle">Spread</div>
          <div className="ask-pane">
            {topAsks.map((ask, i) => (
              <div key={i} className="order-row">
                <span className="price">{ask.price.toFixed(4)}</span>
                <span className="size">{ask.size.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}