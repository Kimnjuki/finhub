import React from 'react';
import { Button } from '@/components/ui/button';

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
type Indicator = 'SMA' | 'EMA' | 'BB' | 'MACD';

interface ChartControlsProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  activeIndicators: Indicator[];
  onToggleIndicator: (indicator: Indicator) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  timeframe,
  onTimeframeChange,
  activeIndicators,
  onToggleIndicator
}) => {
  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  const indicators: Indicator[] = ['SMA', 'EMA', 'BB', 'MACD'];

  return (
    <div className="space-y-3 p-4 bg-card rounded-lg border">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Timeframe</label>
        <div className="flex gap-2 flex-wrap">
          {timeframes.map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange(tf)}
              className="min-w-[60px]"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Technical Indicators</label>
        <div className="flex gap-2 flex-wrap">
          {indicators.map(indicator => (
            <Button
              key={indicator}
              variant={activeIndicators.includes(indicator) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleIndicator(indicator)}
              className="min-w-[60px]"
            >
              {indicator}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
