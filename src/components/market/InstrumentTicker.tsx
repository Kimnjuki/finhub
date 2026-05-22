import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface InstrumentTickerProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
}

export function InstrumentTicker({ symbol, size = 'medium' }: InstrumentTickerProps) {
  const { instruments, streams } = useMarketData();
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    if (!instruments || !streams) return;

    const instrument = instruments.find((i: any) => i.symbol === symbol || i.canonicalSymbol === symbol);
    if (!instrument) return;

    // Find the latest trade for this instrument
    const trade = streams.find((s: any) => s.channel === 'trades' && s.instrumentId === instrument.canonicalSymbol || s.instrumentId === instrument.symbol);
    if (trade && trade.payload) {
      // Parse trade data based on source format
      let tradePrice = 0;
      if (trade.payload.p) {
        tradePrice = parseFloat(trade.payload.p);
      } else if (trade.payload.price) {
        tradePrice = parseFloat(trade.payload.price);
      }
      setPrice(tradePrice);

      // Calculate change if we have previous data
      // For now, just show price
    }
  }, [instruments, streams, symbol]);

  if (price === null) {
    return null;
  }

  const formatPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price);

  return (
    <div className={`instrument-ticker ${size}`}>
      <div className="symbol">{symbol}</div>
      <div className="price">{formatPrice}</div>
      {change && (
        <div className={`change change-${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}