import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, Time, LineStyle } from 'lightweight-charts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingViewCandlestickProps {
  symbol: string;
  interval?: string;
  width?: number;
  height?: number;
  showVolume?: boolean;
  theme?: 'dark' | 'light';
  onCrosshairMove?: (price: number, time: number) => void;
  annotations?: TradeAnnotation[];
}

export interface TradeAnnotation {
  id: string;
  time: number;
  price: number;
  type: 'buy' | 'sell';
  size: number;
  label: string;
}

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w',
};

export function TradingViewCandlestick({
  symbol,
  interval = '1h',
  height = 400,
  showVolume = true,
  theme = 'dark',
  onCrosshairMove,
  annotations = [],
}: TradingViewCandlestickProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const onCrosshairRef = useRef(onCrosshairMove);
  onCrosshairRef.current = onCrosshairMove;

  // Fetch historical data from Binance (REST fallback - works without WebSocket)
  const fetchCandles = useCallback(async () => {
    try {
      const binanceInterval = INTERVAL_MAP[interval] || '1h';
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=500`
      );
      if (!response.ok) throw new Error('Failed to fetch chart data from Binance');
      const data = await response.json();
      const formatted: CandleData[] = data.map((c: any[]) => ({
        time: Math.floor(c[0] / 1000),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5]),
      }));
      setCandles(formatted);
      if (formatted.length > 0) {
        const last = formatted[formatted.length - 1];
        const prev = formatted.length > 1 ? formatted[formatted.length - 2] : last;
        setCurrentPrice(last.close);
        setPriceChange(last.close - prev.close);
        setPriceChangePercent(prev.close !== 0 ? ((last.close - prev.close) / prev.close) * 100 : 0);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching candle data:', err);
      setError(err.message || 'Failed to load chart data');
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Initialize chart once (stable ref for onCrosshairMove)
  useEffect(() => {
    if (!chartContainerRef.current || loading || candles.length === 0) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: theme === 'dark' ? '#9CA3AF' : '#374151',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
        horzLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#6B7280', style: 3 as LineStyle },
        horzLine: { width: 1, color: '#6B7280', style: 3 as LineStyle },
      },
      rightPriceScale: { borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' },
      timeScale: {
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });
    candleSeriesRef.current = candleSeries;

    // Volume series
    if (showVolume) {
      const volumeSeries = (chart as any).addHistogramSeries({
        color: '#6B7280',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Crosshair move handler (uses ref to avoid re-subscription)
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.point && onCrosshairRef.current) {
        const data = param.seriesData.get(candleSeries) as any;
        if (data) {
          onCrosshairRef.current(data.close, data.time as number);
        }
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height,
          });
        } catch (e) {
          // ignore resize errors
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try { chart.remove(); } catch (e) { /* ignore */ }
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [height, theme, showVolume, loading]); // Note: NOT including onCrosshairMove to avoid re-init

  // Update chart data whenever candles change
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0 || loading) return;

    try {
      const candleData = candles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candleSeriesRef.current.setData(candleData);

      if (volumeSeriesRef.current && showVolume) {
        const volumeData = candles.map(c => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      chartRef.current?.timeScale().fitContent();
    } catch (e) {
      // ignore data update errors
    }
  }, [candles, showVolume, loading]);

  // Render trade annotations
  useEffect(() => {
    if (!chartRef.current || annotations.length === 0) return;

    let markerSeries: any;
    try {
      markerSeries = (chartRef.current as any).addLineSeries({
        color: 'transparent',
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const markers = annotations.map(a => ({
        time: a.time as Time,
        position: a.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
        color: a.type === 'buy' ? '#10B981' : '#EF4444',
        shape: a.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
        text: a.label,
        size: Math.min(Math.max(a.size / 10, 0.5), 2),
      }));

      markerSeries.setMarkers(markers);
    } catch (e) {
      // ignore marker errors
    }

    return () => {
      if (markerSeries && chartRef.current) {
        try { chartRef.current.removeSeries(markerSeries); } catch (e) { /* ignore */ }
      }
    };
  }, [annotations]);

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center gap-2" style={{ height }}>
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Price Header */}
      {currentPrice > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{symbol.replace('USDT', '')}/USDT</h3>
            <Badge variant="outline" className="text-xs">{interval}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold font-mono">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {priceChange !== 0 && (
              <span className={`flex items-center gap-1 text-sm font-medium ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      )}
      {/* Chart */}
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" style={{ minHeight: height }} />
    </div>
  );
}

export default TradingViewCandlestick;