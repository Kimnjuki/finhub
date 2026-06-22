import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookDepthProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
}

const MAX_ROWS = 12;

export function OrderBookDepth({ symbol, size = 'medium' }: OrderBookDepthProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState<number>(0);
  const [spreadPercent, setSpreadPercent] = useState<number>(0);
  const [maxTotal, setMaxTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [pricePrecision, setPricePrecision] = useState(2);
  const [sizePrecision, setSizePrecision] = useState(4);
  const wsRef = useRef<WebSocket | null>(null);

  // Real-time order book via Binance WebSocket
  useEffect(() => {
    const wsSymbol = symbol.toLowerCase().includes('usdt') 
      ? symbol.toLowerCase() 
      : `${symbol.toLowerCase()}usdt`;
    const streamName = `${wsSymbol}@depth20@100ms`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!data.bids || !data.asks) return;

        // Calculate running totals
        let bidCumulative = 0;
        const processedBids = data.bids.slice(0, MAX_ROWS).map((bid: string[]) => {
          const price = parseFloat(bid[0]);
          const size = parseFloat(bid[1]);
          bidCumulative += size;
          return { price, size, total: bidCumulative };
        });

        let askCumulative = 0;
        const processedAsks = data.asks.slice(0, MAX_ROWS).reverse().map((ask: string[]) => {
          const price = parseFloat(ask[0]);
          const size = parseFloat(ask[1]);
          askCumulative += size;
          return { price, size, total: askCumulative };
        });

        setBids(processedBids);
        setAsks(processedAsks);
        setMaxTotal(Math.max(bidCumulative, askCumulative));

        // Spread
        if (processedBids.length > 0 && processedAsks.length > 0) {
          const bestBid = processedBids[0].price;
          const bestAsk = processedAsks[processedAsks.length - 1].price;
          const spreadValue = bestAsk - bestBid;
          setSpread(spreadValue);
          setSpreadPercent((spreadValue / bestAsk) * 100);
        }

        // Dynamic precision
        if (processedBids.length > 0) {
          const priceStr = processedBids[0].price.toString();
          const decimals = priceStr.includes('.') ? priceStr.split('.')[1].length : 0;
          setPricePrecision(Math.min(Math.max(decimals, 1), 8));
          setSizePrecision(Math.min(Math.max(decimals, 2), 6));
        }

        setLoading(false);
      } catch (err) {
        // silent parse errors
      }
    };

    ws.onerror = () => {
      console.warn('OrderBook WebSocket error, retrieving via REST');
      setIsConnected(false);
      // Fall back to REST
      fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=20`)
        .then(res => res.json())
        .then(data => {
          let bidCumulative = 0;
          const pb = data.bids.slice(0, MAX_ROWS).map((bid: string[]) => {
            const price = parseFloat(bid[0]);
            const size = parseFloat(bid[1]);
            bidCumulative += size;
            return { price, size, total: bidCumulative };
          });
          let askCumulative = 0;
          const pa = data.asks.slice(0, MAX_ROWS).reverse().map((ask: string[]) => {
            const price = parseFloat(ask[0]);
            const size = parseFloat(ask[1]);
            askCumulative += size;
            return { price, size, total: askCumulative };
          });
          setBids(pb);
          setAsks(pa);
          setMaxTotal(Math.max(bidCumulative, askCumulative));
          if (pb.length > 0 && pa.length > 0) {
            setSpread(pa[pa.length - 1].price - pb[0].price);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbol]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Order Book</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order Book</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs text-muted-foreground">{symbol.replace('USDT', '')}/USDT</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Column headers */}
        <div className="grid grid-cols-3 text-[10px] text-muted-foreground font-semibold px-3 pb-1 border-b border-border/20">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (sell side) */}
        <div className="px-3 py-1 space-y-0.5">
          {asks.slice(0, MAX_ROWS).map((ask, i) => (
            <div key={i} className="relative grid grid-cols-3 text-xs py-0.5">
              <div
                className="absolute inset-0 bg-red-500/10 rounded-sm"
                style={{ width: `${(ask.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
              />
              <span className="relative text-red-500 font-mono text-xs">
                {ask.price.toFixed(pricePrecision)}
              </span>
              <span className="relative text-right font-mono text-xs">
                {ask.size.toFixed(sizePrecision)}
              </span>
              <span className="relative text-right font-mono text-xs text-muted-foreground">
                {ask.total.toFixed(sizePrecision)}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-3 py-1.5 border-y border-border/20 my-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-semibold">
              {spread.toFixed(pricePrecision)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Spread ({spreadPercent.toFixed(3)}%)
            </span>
          </div>
        </div>

        {/* Bids (buy side) */}
        <div className="px-3 py-1 space-y-0.5">
          {bids.slice(0, MAX_ROWS).map((bid, i) => (
            <div key={i} className="relative grid grid-cols-3 text-xs py-0.5">
              <div
                className="absolute inset-0 bg-green-500/10 rounded-sm"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <span className="relative text-green-500 font-mono text-xs">
                {bid.price.toFixed(pricePrecision)}
              </span>
              <span className="relative text-right font-mono text-xs">
                {bid.size.toFixed(sizePrecision)}
              </span>
              <span className="relative text-right font-mono text-xs text-muted-foreground">
                {bid.total.toFixed(sizePrecision)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderBookDepth;