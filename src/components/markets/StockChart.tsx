import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Bar, ComposedChart } from 'recharts';
import { useChartData } from '@/hooks/useChartData';
import { ChartControls } from './ChartControls';
import { Loader2 } from 'lucide-react';

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
type Indicator = 'SMA' | 'EMA' | 'BB' | 'MACD';

interface StockChartProps {
  symbol: string;
  name: string;
}

export const StockChart: React.FC<StockChartProps> = ({ symbol, name }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>(['SMA']);
  const { chartData, loading, error } = useChartData(symbol, timeframe);

  const toggleIndicator = (indicator: Indicator) => {
    setActiveIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <p className="text-muted-foreground">Unable to load chart data</p>
      </div>
    );
  }

  // Format data for recharts
  const chartPoints = chartData.timestamps.map((timestamp, i) => ({
    date: new Date(timestamp * 1000).toLocaleDateString(),
    price: chartData.prices[i],
    volume: chartData.volumes[i],
    sma20: chartData.indicators.sma20?.[i],
    sma50: chartData.indicators.sma50?.[i],
    ema12: chartData.indicators.ema12?.[i],
    ema26: chartData.indicators.ema26?.[i],
    bbUpper: chartData.indicators.bollinger?.[i]?.upper,
    bbMiddle: chartData.indicators.bollinger?.[i]?.middle,
    bbLower: chartData.indicators.bollinger?.[i]?.lower,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{name} ({symbol})</h3>
        {chartData.indicators.rsi && (
          <div className="text-sm">
            <span className="font-semibold">RSI: </span>
            <span className={`font-bold ${
              chartData.indicators.rsi > 70 ? 'text-red-600' :
              chartData.indicators.rsi < 30 ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {chartData.indicators.rsi.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      
      <ChartControls
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        activeIndicators={activeIndicators}
        onToggleIndicator={toggleIndicator}
      />

      {/* Price Chart */}
      <div className="bg-card p-4 rounded-lg border">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            
            {/* Bollinger Bands */}
            {activeIndicators.includes('BB') && (
              <>
                <Area
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="bbLower"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--background))"
                />
                <Line
                  type="monotone"
                  dataKey="bbMiddle"
                  stroke="hsl(var(--muted-foreground))"
                  dot={false}
                  strokeWidth={1}
                  name="BB Middle"
                />
              </>
            )}
            
            {/* Price Line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            
            {/* SMA Lines */}
            {activeIndicators.includes('SMA') && (
              <>
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 20"
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 50"
                />
              </>
            )}
            
            {/* EMA Lines */}
            {activeIndicators.includes('EMA') && (
              <>
                <Line
                  type="monotone"
                  dataKey="ema12"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  name="EMA 12"
                />
                <Line
                  type="monotone"
                  dataKey="ema26"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  dot={false}
                  name="EMA 26"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="bg-card p-4 rounded-lg border">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              name="Volume"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MACD Chart */}
      {activeIndicators.includes('MACD') && chartData.indicators.macd && (
        <div className="bg-card p-4 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">MACD Indicator</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart
              data={chartData.timestamps.map((timestamp, i) => ({
                date: new Date(timestamp * 1000).toLocaleDateString(),
                macd: chartData.indicators.macd?.macd[i],
                signal: chartData.indicators.macd?.signal[i],
                histogram: chartData.indicators.macd?.histogram[i]
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="histogram" fill="hsl(var(--muted-foreground))" name="Histogram" />
              <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#ef4444" dot={false} name="Signal" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
