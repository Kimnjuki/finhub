import React, { useState, useCallback } from 'react';
import { TradingViewCandlestick } from './TradingViewCandlestick';
import { AdvancedDepthChart } from './AdvancedDepthChart';
import { ChartLayoutPresets, LayoutConfig } from './ChartLayoutPresets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { X, Plus, GripVertical } from 'lucide-react';

interface ChartPane {
  id: string;
  symbol: string;
  timeframe: string;
  chartType: 'candlestick' | 'line' | 'area';
  showVolume: boolean;
}

interface MultiChartLayoutProps {
  initialPanes?: ChartPane[];
}

const DEFAULT_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

function createPane(symbol = 'BTCUSDT', timeframe = '1h'): ChartPane {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    symbol,
    timeframe,
    chartType: 'candlestick',
    showVolume: true,
  };
}

export function MultiChartLayout({ initialPanes }: MultiChartLayoutProps) {
  const [panes, setPanes] = useState<ChartPane[]>(() => {
    if (initialPanes && initialPanes.length > 0) return initialPanes;
    return [createPane('BTCUSDT', '1h'), createPane('ETHUSDT', '1h')];
  });

  const [layoutMode, setLayoutMode] = useState<'vertical' | 'grid'>('vertical');

  const addPane = useCallback(() => {
    if (panes.length >= 6) return; // Max 6 panes
    const remainingPairs = DEFAULT_PAIRS.filter(p => !panes.some(pane => pane.symbol === p));
    const nextSymbol = remainingPairs[0] || 'BTCUSDT';
    setPanes(prev => [...prev, createPane(nextSymbol, '1h')]);
  }, [panes]);

  const removePane = useCallback((id: string) => {
    setPanes(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePane = useCallback((id: string, updates: Partial<ChartPane>) => {
    setPanes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Build config for layout presets
  const currentLayoutConfig: LayoutConfig['config'] = {
    symbols: panes.map(p => p.symbol),
    timeframes: panes.map(p => p.timeframe),
    chartTypes: panes.map(p => p.chartType),
    layout: layoutMode === 'vertical' ? (panes.length <= 2 ? '2x1' : '2x2') : '2x2',
    indicators: [],
    drawingTools: [],
  };

  const handleLoadLayout = useCallback((config: LayoutConfig['config']) => {
    const newPanes = config.symbols.map((symbol, i) => ({
      id: Date.now().toString() + i.toString(),
      symbol,
      timeframe: config.timeframes[i] || '1h',
      chartType: (config.chartTypes[i] as ChartPane['chartType']) || 'candlestick',
      showVolume: true,
    }));
    if (newPanes.length > 0) {
      setPanes(newPanes);
    }
  }, []);

  if (panes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-muted-foreground">No chart panes configured</p>
          <Button onClick={() => setPanes([createPane()])}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderPane = (pane: ChartPane, index: number) => (
    <div key={pane.id} className="relative group">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/10 border-b border-border/20 rounded-t-lg">
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-move" />
          <span className="text-xs font-semibold">{pane.symbol.replace('USDT', '')}/USDT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Select
            value={pane.symbol}
            onValueChange={value => updatePane(pane.id, { symbol: value })}
          >
            <SelectTrigger className="h-6 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_PAIRS.map(pair => (
                <SelectItem key={pair} value={pair} className="text-xs">
                  {pair.replace('USDT', '')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-0.5">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => updatePane(pane.id, { timeframe: tf })}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  pane.timeframe === tf
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {panes.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={() => removePane(pane.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-0">
        <TradingViewCandlestick
          symbol={pane.symbol}
          interval={pane.timeframe}
          height={layoutMode === 'vertical' ? 300 : 250}
          showVolume={pane.showVolume}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Multi-Chart Toolbar */}
      <Card>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Multi-Chart: {panes.length} panes</span>
              <Badge variant="outline" className="text-[10px]">
                {layoutMode === 'vertical' ? 'Vertical Split' : 'Grid Layout'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={layoutMode} onValueChange={(v: any) => setLayoutMode(v)}>
                <SelectTrigger className="h-7 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical" className="text-xs">Vertical Split</SelectItem>
                  <SelectItem value="grid" className="text-xs">Grid Layout</SelectItem>
                </SelectContent>
              </Select>

              <ChartLayoutPresets
                currentConfig={currentLayoutConfig}
                onLoadLayout={handleLoadLayout}
              />

              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={addPane} disabled={panes.length >= 6}>
                <Plus className="h-3 w-3 mr-1" />
                Add Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Panes */}
      {layoutMode === 'vertical' ? (
        <ResizablePanelGroup direction="vertical">
          {panes.map((pane, index) => (
            <React.Fragment key={pane.id}>
              <ResizablePanel defaultSize={100 / panes.length} minSize={20}>
                {renderPane(pane, index)}
              </ResizablePanel>
              {index < panes.length - 1 && <ResizableHandle withHandle />}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      ) : (
        <div className={`grid gap-2 ${
          panes.length === 1 ? 'grid-cols-1' :
          panes.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
          panes.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {panes.map((pane, index) => renderPane(pane, index))}
        </div>
      )}
    </div>
  );
}

export default MultiChartLayout;