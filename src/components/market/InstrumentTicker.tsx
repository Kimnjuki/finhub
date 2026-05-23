import React, { useEffect, useState } from 'react';

interface InstrumentTickerProps {
  symbol: string;
  size?: 'small' | 'medium' | 'large';
}

export function InstrumentTicker({ symbol, size = 'medium' }: InstrumentTickerProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [instrument, setInstrument] = useState<any | null>(null);

  // Simulate fetching instrument data
  useEffect(() => {
    // In a real app, you'd fetch this from your API or Convex
    const mockInstrument = { symbol, name: 'Bitcoin' };
    setInstrument(mockInstrument);
  }, [symbol]);

  // Simulate price updates
  useEffect(() => {
    if (!instrument) return;
    
    // Simulate a price update (in reality, you'd subscribe to WebSocket)
    const interval = setInterval(() => {
      setPrice(42000 + Math.random() * 1000);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [instrument]);

  if (price === null || !instrument) {
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
    </div>
  );
}