import React from 'react';
import { TradingSignal as TradingSignalType } from '@/types/stock.types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TradingSignalProps {
  signal: TradingSignalType;
}

export const TradingSignal: React.FC<TradingSignalProps> = ({ signal }) => {
  const getSignalColor = () => {
    switch (signal.type) {
      case 'buy': return 'bg-green-50 text-green-800 border-green-300';
      case 'sell': return 'bg-red-50 text-red-800 border-red-300';
      case 'hold': return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    }
  };

  const getSignalIcon = () => {
    switch (signal.type) {
      case 'buy': return <TrendingUp className="w-5 h-5" />;
      case 'sell': return <TrendingDown className="w-5 h-5" />;
      case 'hold': return <Minus className="w-5 h-5" />;
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getSignalColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {getSignalIcon()}
        <span className="font-bold text-lg uppercase">{signal.type}</span>
        <span className="text-sm">({signal.strength})</span>
      </div>
      
      <p className="text-sm mb-3">{signal.recommendation}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-semibold">RSI:</span> {signal.indicators.rsi.toFixed(2)}
        </div>
        <div>
          <span className="font-semibold">MACD:</span> {signal.indicators.macd}
        </div>
        <div>
          <span className="font-semibold">MA:</span> {signal.indicators.movingAverage}
        </div>
        <div>
          <span className="font-semibold">Volume:</span> {signal.indicators.volume}
        </div>
      </div>
    </div>
  );
};
