import React, { useEffect, useState } from 'react';

interface CandlestickChartProps {
  symbol: string;
  interval?: string;
  width: number;
  height: number;
}

export function CandlestickChart({ symbol, interval = '1h', width, height }: CandlestickChartProps) {
  const [candles, setCandles] = useState<any[]>([]);

  // Simulate candlestick data updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const newCandles: any[] = [];
      const now = Date.now();
      
      // Generate mock candles
      for (let i = 0; i < 50; i++) {
        const baseTime = now - (50 - i) * 60 * 60 * 1000;
        const open = 42000 + Math.random() * 1000;
        const close = open + (Math.random() - 0.5) * 100;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        const volume = Math.random() * 1000;
        
        newCandles.push({
          time: new Date(baseTime),
          open,
          high,
          low,
          close,
          volume,
        });
      }
      
      setCandles(newCandles);
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, []);

  if (candles.length === 0) {
    return null;
  }

  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));

  const chartWidth = width - 40;
  const chartHeight = height - 40;
  const padding = 20;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <pattern id="candlePattern" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="none" />
        </pattern>
      </defs>
      <g transform={`translate(${padding}, ${padding})`}>
        {/* Volume bars at bottom */}
        <g transform={`translate(0, ${chartHeight - 50})`}>
          {candles.map((c: any, i: number) => {
            const x = (i / candles.length) * chartWidth;
            const barWidth = chartWidth / candles.length * 0.8;
            const y = c.volume;
            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={barWidth}
                height={y}
                fill="blue"
                opacity={0.3}
              />
            );
          })}
        </g>

        {/* Candlestick wicks */}
        {candles.map((c: any, i: number) => {
          const x = (i / candles.length) * chartWidth + 0.5;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={c.low}
                x2={x}
                y2={c.high}
                stroke={c.close >= c.open ? 'green' : 'red'}
                strokeWidth={2}
              />
              <rect
                x={x - 0.5}
                y={Math.min(c.open, c.close)}
                width={1}
                height={Math.abs(c.close - c.open)}
                fill={c.close >= c.open ? 'green' : 'red'}
                stroke={c.close >= c.open ? 'green' : 'red'}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}