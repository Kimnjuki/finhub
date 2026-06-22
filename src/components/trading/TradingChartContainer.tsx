import { useState, useEffect } from 'react';
import { ChartCanvas } from './ChartCanvas';
import { ChartToolbar } from './ChartToolbar';
import { IndicatorControls, IndicatorSettings } from './IndicatorControls';
import { IndicatorSettingsModal, IndicatorCustomSettings } from './IndicatorSettingsModal';
import { DrawingToolbar, DrawingTool } from './DrawingToolbar';
import { DrawingCanvas } from './DrawingCanvas';
import { RSIPanel } from './RSIPanel';
import { MACDPanel } from './MACDPanel';
import { StochasticPanel } from './StochasticPanel';
import { AssetSelector, ComparisonAsset } from './AssetSelector';
import { Card } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { IChartApi } from 'lightweight-charts';
import { Drawing, saveDrawings } from '@/lib/drawings';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
export type ChartType = 'candlestick' | 'line' | 'area' | 'bars';

interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const fetchChartData = async (symbol: string, timeframe: Timeframe): Promise<OHLCVData[]> => {
  const intervalMap: Record<Timeframe, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
    '1w': '1w',
  };

  const interval = intervalMap[timeframe];
  const limit = 500;

  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }

  const data = await response.json();

  return data.map((candle: any[]) => ({
    time: Math.floor(candle[0] / 1000),
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
};

export const TradingChartContainer = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [showStochastic, setShowStochastic] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [comparisonAssets, setComparisonAssets] = useState<ComparisonAsset[]>([]);
  const [percentageMode, setPercentageMode] = useState(false);
  const [syncScales, setSyncScales] = useState(true);

  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(() => {
    const saved = localStorage.getItem('indicatorSettings');
    return saved ? JSON.parse(saved) : {
      sma20: false,
      sma50: false,
      sma200: false,
      ema12: false,
      ema26: false,
      bollingerBands: false,
      vwap: false,
    };
  });

  const [customSettings, setCustomSettings] = useState<IndicatorCustomSettings>(() => {
    const saved = localStorage.getItem('indicatorCustomSettings');
    return saved ? JSON.parse(saved) : {
      sma: { period1: 20, period2: 50, period3: 200 },
      ema: { period1: 12, period2: 26 },
      bollinger: { period: 20, stdDev: 2 },
      rsi: { period: 14, overbought: 70, oversold: 30 },
      macd: { fast: 12, slow: 26, signal: 9 },
      stochastic: { kPeriod: 14, dPeriod: 3 },
    };
  });

  useEffect(() => {
    localStorage.setItem('indicatorSettings', JSON.stringify(indicatorSettings));
  }, [indicatorSettings]);

  useEffect(() => {
    localStorage.setItem('indicatorCustomSettings', JSON.stringify(customSettings));
  }, [customSettings]);

  const handleSaveCustomSettings = (settings: IndicatorCustomSettings) => {
    setCustomSettings(settings);
  };

  const handleClearAllDrawings = () => {
    setDrawings([]);
    saveDrawings([]);
  };

  const { data: chartData } = useQuery({
    queryKey: ['chartData', selectedSymbol, timeframe],
    queryFn: () => fetchChartData(selectedSymbol, timeframe),
    refetchInterval: 60000,
  });

  const comparisonSymbols = comparisonAssets.map((asset) => asset.symbol);
  const { data: comparisonResults } = useQuery({
    queryKey: ['chartData', 'comparison', comparisonSymbols.join(','), timeframe],
    queryFn: async () => Promise.all(comparisonAssets.map((asset) => fetchChartData(asset.symbol, timeframe))),
    refetchInterval: 60000,
    enabled: comparisonAssets.length > 0,
  });

  const comparisonData = comparisonAssets.map((asset, index) => ({
    ...asset,
    data: comparisonResults?.[index] || [],
  }));

  const closePrices = chartData?.map(d => d.close) || [];
  const times = chartData?.map(d => d.time) || [];

  const handleAddComparison = (asset: ComparisonAsset) => {
    if (comparisonAssets.length < 3) {
      setComparisonAssets([...comparisonAssets, asset]);
    }
  };

  const handleRemoveComparison = (symbol: string) => {
    setComparisonAssets(comparisonAssets.filter(a => a.symbol !== symbol));
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartToolbar
              timeframe={timeframe}
              chartType={chartType}
              isFullscreen={isFullscreen}
              onTimeframeChange={setTimeframe}
              onChartTypeChange={setChartType}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
          <div className="w-64">
            <AssetSelector
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              comparisonAssets={comparisonAssets}
              onAddComparison={handleAddComparison}
              onRemoveComparison={handleRemoveComparison}
              percentageMode={percentageMode}
              onPercentageModeChange={setPercentageMode}
              syncScales={syncScales}
              onSyncScalesChange={setSyncScales}
            />
          </div>
        </div>
      </Card>

      <IndicatorControls 
        settings={indicatorSettings} 
        onChange={setIndicatorSettings}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <DrawingToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onClearAll={handleClearAllDrawings}
      />

      <Card className="p-4 relative">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="relative">
              <ChartCanvas
                symbol={selectedSymbol}
                timeframe={timeframe}
                chartType={chartType}
                isFullscreen={isFullscreen}
                indicatorSettings={indicatorSettings}
                customSettings={customSettings}
                onChartReady={setChartInstance}
                comparisonData={comparisonData}
                percentageMode={percentageMode}
                syncScales={syncScales}
              />
              <DrawingCanvas
                chart={chartInstance}
                activeTool={activeTool}
                isDrawing={activeTool !== 'select'}
                onDrawingChange={setDrawings}
              />
            </div>
          </ResizablePanel>

          {(showRSI || showMACD || showStochastic) && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="space-y-4 pt-4">
                  {showRSI && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowRSI(false)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                      <RSIPanel 
                        data={closePrices} 
                        times={times}
                        period={customSettings.rsi.period}
                        overbought={customSettings.rsi.overbought}
                        oversold={customSettings.rsi.oversold}
                      />
                    </Card>
                  )}

                  {showMACD && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowMACD(false)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                      <MACDPanel 
                        data={closePrices} 
                        times={times}
                        fastPeriod={customSettings.macd.fast}
                        slowPeriod={customSettings.macd.slow}
                        signalPeriod={customSettings.macd.signal}
                      />
                    </Card>
                  )}

                  {showStochastic && chartData && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowStochastic(false)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                      <StochasticPanel 
                        ohlcvData={chartData}
                        kPeriod={customSettings.stochastic.kPeriod}
                        dPeriod={customSettings.stochastic.dPeriod}
                      />
                    </Card>
                  )}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </Card>

      {(!showRSI || !showMACD || !showStochastic) && (
        <Card className="p-4">
          <div className="flex gap-2">
            {!showRSI && (
              <Button size="sm" variant="outline" onClick={() => setShowRSI(true)}>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show RSI
              </Button>
            )}
            {!showMACD && (
              <Button size="sm" variant="outline" onClick={() => setShowMACD(true)}>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show MACD
              </Button>
            )}
            {!showStochastic && (
              <Button size="sm" variant="outline" onClick={() => setShowStochastic(true)}>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Stochastic
              </Button>
            )}
          </div>
        </Card>
      )}

      <IndicatorSettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        settings={customSettings}
        onSave={handleSaveCustomSettings}
      />
    </div>
  );
};
