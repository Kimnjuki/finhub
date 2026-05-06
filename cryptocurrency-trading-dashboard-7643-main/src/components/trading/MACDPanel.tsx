import { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
import { calculateMACD } from '@/lib/indicators';

interface MACDPanelProps {
  data: number[];
  times: number[];
  height?: number;
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
}

export const MACDPanel = ({ data, times, height = 150, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 }: MACDPanelProps) => {
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

    const { macdLine, signalLine, histogram } = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);

    // MACD Line
    const macdSeries = (chart as any).addLineSeries({
      color: '#3B82F6',
      lineWidth: 2,
    });
    const macdPoints = macdLine
      .map((value, i) => ({
        time: times[i] as Time,
        value: isNaN(value) ? null : value,
      }))
      .filter(p => p.value !== null) as { time: Time; value: number }[];
    macdSeries.setData(macdPoints);

    // Signal Line
    const signalSeries = (chart as any).addLineSeries({
      color: '#EF4444',
      lineWidth: 2,
    });
    const signalPoints = signalLine
      .map((value, i) => ({
        time: times[i] as Time,
        value: isNaN(value) ? null : value,
      }))
      .filter(p => p.value !== null) as { time: Time; value: number }[];
    signalSeries.setData(signalPoints);

    // Histogram
    const histogramSeries = (chart as any).addHistogramSeries({
      priceFormat: {
        type: 'price',
      },
    });
    const histogramPoints = histogram
      .map((value, i) => ({
        time: times[i] as Time,
        value: isNaN(value) ? null : value,
        color: value >= 0 ? '#10B98166' : '#EF444466',
      }))
      .filter(p => p.value !== null) as { time: Time; value: number; color: string }[];
    histogramSeries.setData(histogramPoints);

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
        <h4 className="text-sm font-semibold">MACD ({fastPeriod}, {slowPeriod}, {signalPeriod})</h4>
        <div className="flex gap-3 text-xs">
          <span className="text-blue-500">MACD</span>
          <span className="text-red-500">Signal</span>
          <span className="text-muted-foreground">Histogram</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
