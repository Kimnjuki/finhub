import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface CandlestickChartProps {
  symbol: string;
  interval?: string;
  width: number;
  height: number;
}

export function CandlestickChart({ symbol, interval = '1h', width, height }: CandlestickChartProps) {
  const { streams } = useMarketData();
  const [candles, setCandles] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Find OHLCV data for the instrument
    const ohlcData = streams.find(
      (s: any) => s.channel === 'ohlcv' && s.instrumentId === symbol
    );

    if (ohlcData && ohlcData.payload) {
      // Parse OHLCV data - format depends on exchange
      let candleData: any[] = [];

      if (Array.isArray(ohlcData.payload)) {
        // Handle array of candles
        candleData = ohlcData.payload.map((c: any) => ({
          time: new Date(c[0] * 1000), // Assuming timestamp in seconds
          open: parseFloat(c[1]),
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }));
      } else if (ohlcData.payload.open !== undefined) {
        // Single candle
        candleData = [{
          time: new Date(ohlcData.payload.timestamp * 1000),
          open: parseFloat(ohlcData.payload.open),
          high: parseFloat(ohlcData.payload.high),
          low: parseFloat(ohlcData.payload.low),
          close: parseFloat(ohlcData.payload.close),
          volume: parseFloat(ohlcData.payload.volume),
        }];
      }

      setCandles(candleData);
    }
  }, [streams, symbol]);

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
        <pattern id="candlePattern" width={1} height={1} patternUnits="userSpaceOnUse">
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