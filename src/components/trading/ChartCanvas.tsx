import { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time, LineData } from 'lightweight-charts';
import { Timeframe, ChartType } from './TradingChartContainer';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { IndicatorSettings } from './IndicatorControls';
import { IndicatorCustomSettings } from './IndicatorSettingsModal';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateVWAP,
} from '@/lib/indicators';

interface ComparisonDataItem {
  symbol: string;
  name: string;
  color: string;
  data: OHLCVData[];
}

interface ChartCanvasProps {
  symbol: string;
  timeframe: Timeframe;
  chartType: ChartType;
  isFullscreen: boolean;
  indicatorSettings: IndicatorSettings;
  customSettings: IndicatorCustomSettings;
  onChartReady?: (chart: IChartApi) => void;
  comparisonData?: ComparisonDataItem[];
  percentageMode?: boolean;
  syncScales?: boolean;
}

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

export const ChartCanvas = ({ 
  symbol, 
  timeframe, 
  chartType, 
  isFullscreen, 
  indicatorSettings, 
  customSettings, 
  onChartReady,
  comparisonData = [],
  percentageMode = false,
  syncScales = true,
}: ChartCanvasProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const indicatorSeriesRef = useRef<Map<string, any>>(new Map());

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['chartData', symbol, timeframe],
    queryFn: () => fetchChartData(symbol, timeframe),
    refetchInterval: 60000,
  });

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 150 : 500,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#6B7280',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#6B7280',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    onChartReady?.(chart);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 150 : 500,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isFullscreen]);

  // Update chart data and type
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    // Remove existing series
    if (mainSeriesRef.current) {
      chartRef.current.removeSeries(mainSeriesRef.current);
    }
    if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
    }

    // Calculate percentage change if in percentage mode
    const getPercentageData = (data: OHLCVData[], basePrice: number): LineData[] => {
      return data.map(d => ({
        time: d.time as Time,
        value: ((d.close - basePrice) / basePrice) * 100,
      }));
    };

    const basePrice = chartData[0]?.close || 0;

    // Create main series based on comparison mode and chart type
    let mainSeries: any;
    
    if (comparisonData.length > 0 && percentageMode) {
      // In percentage comparison mode, show all as lines
      const mainLineData = getPercentageData(chartData, basePrice);
      mainSeries = (chartRef.current as any).addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: symbol.replace('USDT', ''),
      });
      mainSeries.setData(mainLineData);

      // Add comparison lines
      comparisonData.forEach((comparison) => {
        if (comparison.data.length > 0) {
          const compBasePrice = comparison.data[0].close;
          const compLineData = getPercentageData(comparison.data, compBasePrice);
          const compLineSeries = (chartRef.current as any).addLineSeries({
            color: comparison.color,
            lineWidth: 2,
            title: comparison.name,
          });
          compLineSeries.setData(compLineData);
        }
      });
    } else if (comparisonData.length > 0) {
      // In absolute comparison mode, show all as lines
      const mainLineData: LineData[] = chartData.map(d => ({
        time: d.time as Time,
        value: d.close,
      }));
      mainSeries = (chartRef.current as any).addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: symbol.replace('USDT', ''),
        priceScaleId: 'right',
      });
      mainSeries.setData(mainLineData);

      // Add comparison lines
      comparisonData.forEach((comparison, index) => {
        if (comparison.data.length > 0) {
          const compLineData: LineData[] = comparison.data.map(d => ({
            time: d.time as Time,
            value: d.close,
          }));
          const compLineSeries = (chartRef.current as any).addLineSeries({
            color: comparison.color,
            lineWidth: 2,
            title: comparison.name,
            priceScaleId: syncScales ? 'right' : `comparison-${index}`,
          });
          compLineSeries.setData(compLineData);

          if (!syncScales) {
            chartRef.current?.priceScale(`comparison-${index}`).applyOptions({
              scaleMargins: {
                top: 0.1,
                bottom: 0.2,
              },
            });
          }
        }
      });
    } else if (chartType === 'candlestick') {
      mainSeries = (chartRef.current as any).addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
      
      const candleData = chartData.map(d => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      mainSeries.setData(candleData);
    } else if (chartType === 'line') {
      mainSeries = (chartRef.current as any).addLineSeries({
        color: '#8B5CF6',
        lineWidth: 2,
      });
      
      const lineData = chartData.map(d => ({
        time: d.time as Time,
        value: d.close,
      }));
      mainSeries.setData(lineData);
    } else if (chartType === 'area') {
      mainSeries = (chartRef.current as any).addAreaSeries({
        topColor: 'rgba(139, 92, 246, 0.4)',
        bottomColor: 'rgba(139, 92, 246, 0.0)',
        lineColor: '#8B5CF6',
        lineWidth: 2,
      });
      
      const areaData = chartData.map(d => ({
        time: d.time as Time,
        value: d.close,
      }));
      mainSeries.setData(areaData);
    } else {
      mainSeries = (chartRef.current as any).addBarSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
      });
      
      const barData = chartData.map(d => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      mainSeries.setData(barData);
    }

    mainSeriesRef.current = mainSeries;

    // Add volume series
    const volumeSeries = (chartRef.current as any).addHistogramSeries({
      color: '#6B7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chartRef.current.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = chartData.map(d => ({
      time: d.time as Time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }));

    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;

    // Fit content
    chartRef.current.timeScale().fitContent();

    // Add current price line (only if not in comparison mode)
    if (chartData.length > 0 && comparisonData.length === 0) {
      const lastPrice = chartData[chartData.length - 1].close;
      mainSeries.createPriceLine({
        price: lastPrice,
        color: '#3B82F6',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Current',
      });
    }
  }, [chartData, chartType, comparisonData, percentageMode, syncScales]);

  // Update indicators
  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.length === 0) return;

    // Remove existing indicator series
    indicatorSeriesRef.current.forEach((series) => {
      chartRef.current?.removeSeries(series);
    });
    indicatorSeriesRef.current.clear();

    const closePrices = chartData.map(d => d.close);
    const times = chartData.map(d => d.time);

    // SMA 20
    if (indicatorSettings.sma20) {
      const sma20 = calculateSMA(closePrices, customSettings.sma.period1);
      const sma20Series = (chartRef.current as any).addLineSeries({
        color: '#EAB308',
        lineWidth: 2,
        title: 'SMA 20',
      });
      const sma20Data = sma20
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      sma20Series.setData(sma20Data);
      indicatorSeriesRef.current.set('sma20', sma20Series);
    }

    // SMA 50
    if (indicatorSettings.sma50) {
      const sma50 = calculateSMA(closePrices, customSettings.sma.period2);
      const sma50Series = (chartRef.current as any).addLineSeries({
        color: '#F97316',
        lineWidth: 2,
        title: 'SMA 50',
      });
      const sma50Data = sma50
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      sma50Series.setData(sma50Data);
      indicatorSeriesRef.current.set('sma50', sma50Series);
    }

    // SMA 200
    if (indicatorSettings.sma200) {
      const sma200 = calculateSMA(closePrices, customSettings.sma.period3);
      const sma200Series = (chartRef.current as any).addLineSeries({
        color: '#A855F7',
        lineWidth: 2,
        title: 'SMA 200',
      });
      const sma200Data = sma200
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      sma200Series.setData(sma200Data);
      indicatorSeriesRef.current.set('sma200', sma200Series);
    }

    // EMA 12
    if (indicatorSettings.ema12) {
      const ema12 = calculateEMA(closePrices, customSettings.ema.period1);
      const ema12Series = (chartRef.current as any).addLineSeries({
        color: '#3B82F6',
        lineWidth: 2,
        title: 'EMA 12',
      });
      const ema12Data = ema12
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      ema12Series.setData(ema12Data);
      indicatorSeriesRef.current.set('ema12', ema12Series);
    }

    // EMA 26
    if (indicatorSettings.ema26) {
      const ema26 = calculateEMA(closePrices, customSettings.ema.period2);
      const ema26Series = (chartRef.current as any).addLineSeries({
        color: '#EF4444',
        lineWidth: 2,
        title: 'EMA 26',
      });
      const ema26Data = ema26
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      ema26Series.setData(ema26Data);
      indicatorSeriesRef.current.set('ema26', ema26Series);
    }

    // Bollinger Bands
    if (indicatorSettings.bollingerBands) {
      const bb = calculateBollingerBands(closePrices, customSettings.bollinger.period, customSettings.bollinger.stdDev);
      
      const upperSeries = (chartRef.current as any).addLineSeries({
        color: '#06B6D4',
        lineWidth: 1,
        title: 'BB Upper',
      });
      const upperData = bb
        .map((band, i) => ({ time: times[i] as Time, value: band.upper }))
        .filter(p => !isNaN(p.value));
      upperSeries.setData(upperData);
      indicatorSeriesRef.current.set('bb_upper', upperSeries);

      const middleSeries = (chartRef.current as any).addLineSeries({
        color: '#06B6D4',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Middle',
      });
      const middleData = bb
        .map((band, i) => ({ time: times[i] as Time, value: band.middle }))
        .filter(p => !isNaN(p.value));
      middleSeries.setData(middleData);
      indicatorSeriesRef.current.set('bb_middle', middleSeries);

      const lowerSeries = (chartRef.current as any).addLineSeries({
        color: '#06B6D4',
        lineWidth: 1,
        title: 'BB Lower',
      });
      const lowerData = bb
        .map((band, i) => ({ time: times[i] as Time, value: band.lower }))
        .filter(p => !isNaN(p.value));
      lowerSeries.setData(lowerData);
      indicatorSeriesRef.current.set('bb_lower', lowerSeries);
    }

    // VWAP
    if (indicatorSettings.vwap) {
      const vwap = calculateVWAP(chartData);
      const vwapSeries = (chartRef.current as any).addLineSeries({
        color: '#10B981',
        lineWidth: 2,
        title: 'VWAP',
      });
      const vwapData = vwap
        .map((value, i) => ({ time: times[i] as Time, value }))
        .filter(p => !isNaN(p.value));
      vwapSeries.setData(vwapData);
      indicatorSeriesRef.current.set('vwap', vwapSeries);
    }
  }, [chartData, indicatorSettings, customSettings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{symbol.replace('USDT', '')}/USDT</h3>
        {chartData && chartData.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              O: <span className="text-foreground">${chartData[chartData.length - 1].open.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              H: <span className="text-foreground">${chartData[chartData.length - 1].high.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              L: <span className="text-foreground">${chartData[chartData.length - 1].low.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              C: <span className="text-foreground">${chartData[chartData.length - 1].close.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              V: <span className="text-foreground">{chartData[chartData.length - 1].volume.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
