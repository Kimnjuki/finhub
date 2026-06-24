import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
}

const TradingViewWidget = ({
  symbol = 'BTCUSDT',
  interval = 'D',
  theme = 'dark',
  height = 500
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = () => {
      if (!containerRef.current) return;

      try {
        const widget = new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: 'candle',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          studies: [
            'MASimple@tv-basicstudies',
          ],
        });

        setIsLoading(false);
        setError(null);
      } catch (e) {
        console.error('TradingView widget error:', e);
        setError('Failed to initialize chart');
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError('Failed to load TradingView library');
      setIsLoading(false);
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8" style={{ minHeight: height }}>
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Chart temporarily unavailable</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex items-center justify-center" style={{ minHeight: height }}>
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading chart...</p>
                </div>
              </div>
            )}
            <div
              ref={containerRef}
              id={`tradingview_widget_${symbol}`}
              className="w-full rounded-lg overflow-hidden"
              style={{ minHeight: isLoading ? 0 : height }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget;