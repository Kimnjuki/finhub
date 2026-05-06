import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
}

export const OrderBook = ({ symbol }: OrderBookProps) => {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsSymbol = symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@depth20@100ms`);

    ws.onopen = () => {
      console.log('OrderBook WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Process bids (buy orders)
        const processedBids = data.bids.slice(0, 15).map((bid: string[], index: number, array: string[][]) => {
          const price = parseFloat(bid[0]);
          const quantity = parseFloat(bid[1]);
          const total = array.slice(0, index + 1).reduce((sum, b) => sum + parseFloat(b[1]), 0);
          return { price, quantity, total };
        });

        // Process asks (sell orders)
        const processedAsks = data.asks.slice(0, 15).map((ask: string[], index: number, array: string[][]) => {
          const price = parseFloat(ask[0]);
          const quantity = parseFloat(ask[1]);
          const total = array.slice(0, index + 1).reduce((sum, a) => sum + parseFloat(a[1]), 0);
          return { price, quantity, total };
        }).reverse();

        setBids(processedBids);
        setAsks(processedAsks);
      } catch (error) {
        console.error('Error parsing order book data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('OrderBook WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('OrderBook WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  );

  if (!isConnected || (bids.length === 0 && asks.length === 0)) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Order Book</h3>
      
      <div className="space-y-1">
        <div className="grid grid-cols-3 text-xs text-muted-foreground font-semibold pb-2 border-b">
          <div className="text-left">Price (USDT)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell orders) - Red */}
        <div className="space-y-0.5">
          {asks.map((ask, index) => (
            <div key={`ask-${index}`} className="relative grid grid-cols-3 text-xs py-1">
              <div
                className="absolute inset-0 bg-red-500/10"
                style={{ width: `${(ask.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
              />
              <div className="relative text-red-500 font-mono">{ask.price.toFixed(2)}</div>
              <div className="relative text-right font-mono">{ask.quantity.toFixed(6)}</div>
              <div className="relative text-right font-mono text-muted-foreground">{ask.total.toFixed(6)}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-2 text-center border-y my-2">
          <div className="text-lg font-bold">
            {bids[0] && asks[asks.length - 1] && (
              <>
                <span className="text-muted-foreground text-sm mr-2">Spread:</span>
                <span className="text-foreground">
                  {(asks[asks.length - 1].price - bids[0].price).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bids (Buy orders) - Green */}
        <div className="space-y-0.5">
          {bids.map((bid, index) => (
            <div key={`bid-${index}`} className="relative grid grid-cols-3 text-xs py-1">
              <div
                className="absolute inset-0 bg-green-500/10"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <div className="relative text-green-500 font-mono">{bid.price.toFixed(2)}</div>
              <div className="relative text-right font-mono">{bid.quantity.toFixed(6)}</div>
              <div className="relative text-right font-mono text-muted-foreground">{bid.total.toFixed(6)}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
