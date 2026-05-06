import { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
import { calculateRSI } from '@/lib/indicators';

interface RSIPanelProps {
  data: number[];
  times: number[];
  height?: number;
  period?: number;
  overbought?: number;
  oversold?: number;
}

export const RSIPanel = ({ data, times, height = 150, period = 14, overbought = 70, oversold = 30 }: RSIPanelProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

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

    const rsiData = calculateRSI(data, period);
    const rsiSeries = (chart as any).addLineSeries({
      color: '#A78BFA',
      lineWidth: 2,
    });

    const rsiPoints = rsiData
      .map((value, i) => ({
        time: times[i] as Time,
        value: isNaN(value) ? null : value,
      }))
      .filter(p => p.value !== null) as { time: Time; value: number }[];

    rsiSeries.setData(rsiPoints);

    // Overbought line (70)
    const overboughtSeries = (chart as any).addLineSeries({
      color: '#EF4444',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    overboughtSeries.setData(
      times.map((t) => ({ time: t as Time, value: overbought }))
    );

    // Oversold line
    const oversoldSeries = (chart as any).addLineSeries({
      color: '#10B981',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    oversoldSeries.setData(
      times.map((t) => ({ time: t as Time, value: oversold }))
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
  }, [data, times, height]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-semibold">RSI ({period})</h4>
        {data.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Current: {calculateRSI(data, period).slice(-1)[0]?.toFixed(2) || 'N/A'}
          </span>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
