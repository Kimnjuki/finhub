import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, BarChart3, LineChart, AreaChart, CandlestickChart } from 'lucide-react';
import { Timeframe, ChartType } from './TradingChartContainer';

interface ChartToolbarProps {
  timeframe: Timeframe;
  chartType: ChartType;
  isFullscreen: boolean;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onChartTypeChange: (type: ChartType) => void;
  onFullscreenToggle: () => void;
}

const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

export const ChartToolbar = ({
  timeframe,
  chartType,
  isFullscreen,
  onTimeframeChange,
  onChartTypeChange,
  onFullscreenToggle,
}: ChartToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium mr-2">Timeframe:</span>
        {timeframes.map((tf) => (
          <Button
            key={tf}
            size="sm"
            variant={timeframe === tf ? 'default' : 'outline'}
            onClick={() => onTimeframeChange(tf)}
            className="h-8 px-3"
          >
            {tf}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm font-medium mr-2">Chart Type:</span>
        <Button
          size="sm"
          variant={chartType === 'candlestick' ? 'default' : 'outline'}
          onClick={() => onChartTypeChange('candlestick')}
          className="h-8 px-3"
        >
          <CandlestickChart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={chartType === 'line' ? 'default' : 'outline'}
          onClick={() => onChartTypeChange('line')}
          className="h-8 px-3"
        >
          <LineChart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={chartType === 'area' ? 'default' : 'outline'}
          onClick={() => onChartTypeChange('area')}
          className="h-8 px-3"
        >
          <AreaChart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={chartType === 'bars' ? 'default' : 'outline'}
          onClick={() => onChartTypeChange('bars')}
          className="h-8 px-3"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" className="h-8 px-3">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 px-3">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onFullscreenToggle}
          className="h-8 px-3"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
