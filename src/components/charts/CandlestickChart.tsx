import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  interval?: string;
  width?: number;
  height?: number;
}

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w',
};

export function CandlestickChart({ symbol, interval = '1h', width, height = 400 }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch historical data from Binance
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const binanceInterval = INTERVAL_MAP[interval] || '1h';
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=200`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (!mounted) return;

        const candles: CandleData[] = data.map((c: any[]) => ({
          time: Math.floor(c[0] / 1000),
          open: parseFloat(c[1]),
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }));

        if (!chartContainerRef.current) return;

        // Destroy existing chart
        if (chartRef.current) {
          chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth || width || 600,
          height,
          layout: {
            background: { color: 'transparent' },
            textColor: '#9CA3AF',
          },
          grid: {
            vertLines: { color: '#374151' },
            horzLines: { color: '#374151' },
          },
          crosshair: {
            mode: 1,
            vertLine: { width: 1, color: '#6B7280', style: 3 as any },
            horzLine: { width: 1, color: '#6B7280', style: 3 as any },
          },
          rightPriceScale: { borderColor: '#374151' },
          timeScale: {
            borderColor: '#374151',
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

        candleSeries.setData(candles.map(c => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })));

        // Volume
        const volumeSeries = (chart as any).addHistogramSeries({
          color: '#6B7280',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        });
        chart.priceScale('volume').applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        });
        volumeSeries.setData(candles.map(c => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        })));

        chart.timeScale().fitContent();

        // Resize handler
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        setLoading(false);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        if (mounted) {
          setError('Failed to load chart data');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [symbol, interval, height, width]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-destructive text-sm">{error}</p>
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
    <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
  );
}

export default CandlestickChart;