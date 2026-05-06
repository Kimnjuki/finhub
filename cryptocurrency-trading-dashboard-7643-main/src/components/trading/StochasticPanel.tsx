import { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
import { calculateStochastic } from '@/lib/indicators';

interface StochasticPanelProps {
  ohlcvData: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  height?: number;
  kPeriod?: number;
  dPeriod?: number;
}

export const StochasticPanel = ({ ohlcvData, height = 150, kPeriod = 14, dPeriod = 3 }: StochasticPanelProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || ohlcvData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        visible: false,
      },
    });

    chartRef.current = chart;

    const { kLine, dLine } = calculateStochastic(ohlcvData, kPeriod, dPeriod);

    // %K Line
    const kSeries = (chart as any).addLineSeries({
      color: '#F59E0B',
      lineWidth: 2,
    });
    const kPoints = kLine
      .map((value, i) => ({
        time: ohlcvData[i].time as Time,
        value: isNaN(value) ? null : value,
      }))
      .filter(p => p.value !== null) as { time: Time; value: number }[];
    kSeries.setData(kPoints);

    // %D Line
    const dSeries = (chart as any).addLineSeries({
      color: '#8B5CF6',
      lineWidth: 2,
    });
    const dPoints = dLine
      .map((value, i) => ({
        time: ohlcvData[i].time as Time,
        value: isNaN(value) ? null : value,
      }))
      .filter(p => p.value !== null) as { time: Time; value: number }[];
    dSeries.setData(dPoints);

    // Overbought line (80)
    const overboughtSeries = (chart as any).addLineSeries({
      color: '#EF4444',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    overboughtSeries.setData(
      ohlcvData.map((d) => ({ time: d.time as Time, value: 80 }))
    );

    // Oversold line (20)
    const oversoldSeries = (chart as any).addLineSeries({
      color: '#10B981',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    oversoldSeries.setData(
      ohlcvData.map((d) => ({ time: d.time as Time, value: 20 }))
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [ohlcvData, height]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-semibold">Stochastic ({kPeriod}, {dPeriod})</h4>
        <div className="flex gap-3 text-xs">
          <span className="text-orange-500">%K</span>
          <span className="text-purple-500">%D</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
