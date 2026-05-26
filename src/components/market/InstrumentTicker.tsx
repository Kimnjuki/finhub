import React, { useEffect, useState } from 'react';
import { useMultiSourcePrice } from '@/services/marketData/hooks/useMultiSourcePrice';
import { AssetClass } from '@/services/marketData/types';

interface InstrumentTickerProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
  assetClass?: AssetClass;
}

export function InstrumentTicker({ symbol, size = 'medium', assetClass }: InstrumentTickerProps) {
  const { quote, loading, error } = useMultiSourcePrice(symbol, assetClass || 'crypto');

  if (loading) {
    return (
      <div className={`instrument-ticker ${size} animate-pulse`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className={`instrument-ticker ${size}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="symbol">{symbol}</span>
          <span className="text-xs">— Offline</span>
        </div>
      </div>
    );
  }

  const formatPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(quote.price);

  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? 'text-green-500' : 'text-red-500';
  const confidenceIndicator = quote.confidence === 'high' ? '✓' : quote.confidence === 'medium' ? '~' : '?';

  return (
    <div className={`instrument-ticker ${size} p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="symbol font-semibold">{symbol}</span>
          {quote.sourceCount > 0 && (
            <span className="text-[10px] text-muted-foreground" title={`Aggregated from ${quote.sourceCount} sources`}>
              {confidenceIndicator} {quote.sourceCount}
            </span>
          )}
        </div>
        <div className={`text-[10px] ${changeClass}`}>
          {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="price text-lg font-bold">{formatPrice}</div>
        <div className={`text-sm font-medium ${changeClass}`}>
          {isPositive ? '▲' : '▼'} ${Math.abs(quote.change).toFixed(2)}
        </div>
      </div>
      {size !== 'small' && quote.spread !== undefined && (
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Spread: {quote.spread.toFixed(1)} bps</span>
          <span>Vol: {quote.volume24h ? formatCompactNumber(quote.volume24h) : 'N/A'}</span>
        </div>
      )}
    </div>
  );
}

function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}