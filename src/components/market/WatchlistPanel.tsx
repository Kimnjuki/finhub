import React, { useEffect, useState } from 'react';
import { useMultiSourcePrices } from '@/services/marketData/hooks/useMultiSourcePrice';
import { AssetClass, AggregatedQuote } from '@/services/marketData/types';

interface WatchlistPanelProps {
  symbols?: string[];
  assetClass?: AssetClass;
}

export function WatchlistPanel({ symbols, assetClass = 'crypto' }: WatchlistPanelProps) {
  const displaySymbols = symbols || ['BTC-USD', 'ETH-USD', 'SOL-USD', 'AVAX-USD', 'LINK-USD'];
  const { quotes, loading } = useMultiSourcePrices(displaySymbols, assetClass);

  if (loading) {
    return (
      <div className="watchlist-panel p-4">
        <h3 className="font-semibold mb-3">Market Watchlist</h3>
        <div className="space-y-2">
          {displaySymbols.map(s => (
            <div key={s} className="animate-pulse h-12 bg-muted/20 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Market Watchlist</h3>
        <span className="text-[10px] text-muted-foreground">
          {quotes.size}/{displaySymbols.length} active
        </span>
      </div>
      <div className="space-y-1">
        {displaySymbols.map(symbol => {
          const quote = quotes.get(symbol);
          return (
            <WatchlistRow key={symbol} symbol={symbol} quote={quote} />
          );
        })}
      </div>
    </div>
  );
}

function WatchlistRow({ symbol, quote }: { symbol: string; quote?: AggregatedQuote }) {
  if (!quote) {
    return (
      <div className="flex items-center justify-between p-2 rounded bg-muted/10 text-muted-foreground text-sm">
        <span>{symbol}</span>
        <span className="text-[10px]">pending...</span>
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const formatPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(quote.price);

  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/20 transition-colors cursor-pointer group">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{symbol}</span>
        <span className={`text-xs font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {formatPrice}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
        </span>
        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
              title={`Sources: ${quote.sources.join(', ')}`}>
          {quote.sourceCount}s
        </span>
      </div>
    </div>
  );
}