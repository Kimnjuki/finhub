import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface MarketTabsProps {
  symbols: string[];
  onSymbolChange?: (symbol: string) => void;
}

export function MarketTabs({ symbols, onSymbolChange }: MarketTabsProps) {
  const { streams } = useMarketData();
  const [activeSymbol, setActiveSymbol] = useState(symbols[0] || '');

  useEffect(() => {
    if (symbols.length > 0) {
      setActiveSymbol(symbols[0]);
    }
  }, [symbols]);

  const handleSymbolChange = (symbol: string) => {
    setActiveSymbol(symbol);
    onSymbolChange?.(symbol);
  };

  return (
    <div className="market-tabs">
      <div className="tabs">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className={`tab ${activeSymbol === symbol ? 'active' : ''}`}
            onClick={() => handleSymbolChange(symbol)}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}