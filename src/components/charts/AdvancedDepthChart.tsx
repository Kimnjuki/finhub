import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createChart, IChartApi, AreaSeries } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface DepthLevel {
  price: number;
  size: number;
  total: number;
}

interface AdvancedDepthChartProps {
  symbol: string;
  height?: number;
}

// REST API fallback for Binance order book
async function fetchBinanceDepth(symbol: string): Promise<{ bids: string[][]; asks: string[][] } | null> {
  try {
    const normalizedSymbol = symbol
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/usd$/, 'usdt');
    const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${normalizedSymbol.toUpperCase()}&limit=20`);
    if (!res.ok) return null;
    const data = await res.json();
    return { bids: data.bids, asks: data.asks };
  } catch {
    return null;
  }
}

export function AdvancedDepthChart({ symbol, height = 400 }: AdvancedDepthChartProps) {
  const bidContainerRef = useRef<HTMLDivElement>(null);
  const askContainerRef = useRef<HTMLDivElement>(null);
  const bidChartRef = useRef<IChartApi | null>(null);
  const askChartRef = useRef<IChartApi | null>(null);
  const [bids, setBids] = useState<DepthLevel[]>([]);
  const [asks, setAsks] = useState<DepthLevel[]>([]);
  const [spread, setSpread] = useState<number>(0);
  const [spreadPercent, setSpreadPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bidTotal, setBidTotal] = useState(0);
  const [askTotal, setAskTotal] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const restFallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Process depth data (shared between WS and REST)
  const processDepthData = useCallback((data: { bids: string[][]; asks: string[][] }) => {
    // Process bids
    const processedBids = data.bids.slice(0, 20).map((bid: string[]) => ({
      price: parseFloat(bid[0]),
      size: parseFloat(bid[1]),
      total: 0,
    }));

    // Calculate cumulative totals
    let bidCumulative = 0;
    const bidsWithTotal = processedBids.map((b: DepthLevel) => {
      bidCumulative += b.size;
      return { ...b, total: bidCumulative };
    });

    // Process asks
    const processedAsks = data.asks.slice(0, 20).map((ask: string[]) => ({
      price: parseFloat(ask[0]),
      size: parseFloat(ask[1]),
      total: 0,
    }));

    let askCumulative = 0;
    const asksWithTotal = processedAsks.reverse().map((a: DepthLevel) => {
      askCumulative += a.size;
      return { ...a, total: askCumulative };
    });

    setBids(bidsWithTotal);
    setAsks(asksWithTotal);
    setBidTotal(bidCumulative);
    setAskTotal(askCumulative);

    // Calculate spread
    if (bidsWithTotal.length > 0 && asksWithTotal.length > 0) {
      const bestBid = bidsWithTotal[0].price;
      const bestAsk = asksWithTotal[asksWithTotal.length - 1].price;
      const spreadValue = bestAsk - bestBid;
      setSpread(spreadValue);
      setSpreadPercent((spreadValue / bestAsk) * 100);
    }

    setLoading(false);
  }, []);

  // Real-time order book via Binance WebSocket + REST fallback
  useEffect(() => {
    // Normalize symbol for Binance
    const wsSymbol = symbol
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/usd$/, 'usdt');
    
    // Try WebSocket first
    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@depth20@100ms`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bids && data.asks) {
            processDepthData({ bids: data.bids, asks: data.asks });
          }
        } catch (err) {
          // silent parse errors
        }
      };

      ws.onerror = () => {
        console.warn('Depth WebSocket error, falling back to REST API');
        ws.close();
        wsRef.current = null;
      };

      ws.onclose = () => {
        // If WebSocket fails, poll REST API
        if (!restFallbackRef.current) {
          fetchBinanceDepth(symbol).then(data => {
            if (data) processDepthData(data);
          });
          restFallbackRef.current = setInterval(async () => {
            const data = await fetchBinanceDepth(symbol);
            if (data) processDepthData(data);
          }, 3000);
        }
      };
    } catch {
      // WebSocket not supported, use REST directly
      fetchBinanceDepth(symbol).then(data => {
        if (data) processDepthData(data);
      });
      restFallbackRef.current = setInterval(async () => {
        const data = await fetchBinanceDepth(symbol);
        if (data) processDepthData(data);
      }, 3000);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
        restFallbackRef.current = null;
      }
    };
  }, [symbol, processDepthData]);

  // Render mini bid depth chart using lightweight-charts v5 API
  useEffect(() => {
    if (!bidContainerRef.current || bids.length === 0) return;

    if (bidChartRef.current) {
      bidChartRef.current.remove();
    }

    const chart = createChart(bidContainerRef.current, {
      width: bidContainerRef.current.clientWidth,
      height: 120,
      layout: { background: { color: 'transparent' }, textColor: '#9CA3AF' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0, vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    bidChartRef.current = chart;

    // lightweight-charts v5 uses chart.addSeries(SeriesType, options)
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(16, 185, 129, 0.3)',
      bottomColor: 'rgba(16, 185, 129, 0.0)',
      lineColor: '#10B981',
      lineWidth: 2,
    });

    const data = bids.map((b, i) => ({
      time: (1700000000 + i) as any,
      value: b.total,
    }));
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [bids]);

  // Render mini ask depth chart
  useEffect(() => {
    if (!askContainerRef.current || asks.length === 0) return;

    if (askChartRef.current) {
      askChartRef.current.remove();
    }

    const chart = createChart(askContainerRef.current, {
      width: askContainerRef.current.clientWidth,
      height: 120,
      layout: { background: { color: 'transparent' }, textColor: '#9CA3AF' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0, vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    askChartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(239, 68, 68, 0.3)',
      bottomColor: 'rgba(239, 68, 68, 0.0)',
      lineColor: '#EF4444',
      lineWidth: 2,
    });

    const data = asks.map((a, i) => ({
      time: (1700000000 + i) as any,
      value: a.total,
    }));
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [asks]);

  const maxTotal = Math.max(bidTotal, askTotal);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Depth Chart — {symbol.replace('USDT', '')}/USDT</span>
          <Badge variant="secondary" className="text-xs">
            Spread: {spread.toFixed(2)} ({spreadPercent.toFixed(3)}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Bids Side */}
          <div>
            <div className="text-xs text-green-500 font-medium mb-1">Bids (Buy Pressure)</div>
            <div ref={bidContainerRef} className="mb-2 rounded overflow-hidden" />
            <div className="space-y-0.5">
              {bids.slice(0, 10).map((bid, i) => (
                <div key={i} className="relative grid grid-cols-3 text-xs py-0.5">
                  <div
                    className="absolute inset-0 bg-green-500/10 rounded"
                    style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                  />
                  <span className="relative text-green-500 font-mono">{bid.price.toFixed(2)}</span>
                  <span className="relative text-right font-mono">{bid.size.toFixed(4)}</span>
                  <span className="relative text-right font-mono text-muted-foreground">{bid.total.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks Side */}
          <div>
            <div className="text-xs text-red-500 font-medium mb-1">Asks (Sell Pressure)</div>
            <div ref={askContainerRef} className="mb-2 rounded overflow-hidden" />
            <div className="space-y-0.5">
              {asks.slice(0, 10).map((ask, i) => (
                <div key={i} className="relative grid grid-cols-3 text-xs py-0.5">
                  <div
                    className="absolute inset-0 bg-red-500/10 rounded"
                    style={{ width: `${(ask.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
                  />
                  <span className="relative text-red-500 font-mono">{ask.price.toFixed(2)}</span>
                  <span className="relative text-right font-mono">{ask.size.toFixed(4)}</span>
                  <span className="relative text-right font-mono text-muted-foreground">{ask.total.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Imbalance Indicator */}
        {bidTotal > 0 && askTotal > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Bid Volume: {bidTotal.toFixed(2)}</span>
              <span>Ask Volume: {askTotal.toFixed(2)}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted/20">
              <div
                className="bg-green-500/60 transition-all duration-300"
                style={{ width: `${(bidTotal / (bidTotal + askTotal)) * 100}%` }}
              />
              <div
                className="bg-red-500/60 transition-all duration-300"
                style={{ width: `${(askTotal / (bidTotal + askTotal)) * 100}%` }}
              />
            </div>
            <div className="text-center text-xs mt-1 text-muted-foreground">
              {bidTotal > askTotal
                ? `🟢 Buy pressure dominates (${((bidTotal / (bidTotal + askTotal)) * 100).toFixed(1)}% bids)`
                : `🔴 Sell pressure dominates (${((askTotal / (bidTotal + askTotal)) * 100).toFixed(1)}% asks)`
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdvancedDepthChart;