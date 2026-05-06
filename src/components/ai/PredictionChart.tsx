import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

interface PredictionChartProps {
  currentPrice: number;
  predictedPrice: number;
  priceRange: { low: number; high: number };
  timeframe: string;
}

const PredictionChart = ({ currentPrice, predictedPrice, priceRange, timeframe }: PredictionChartProps) => {
  const isPositive = predictedPrice > currentPrice;
  
  const data = [
    { point: 'Current', price: currentPrice, prediction: null, low: null, high: null },
    { point: 'Prediction', price: null, prediction: predictedPrice, low: priceRange.low, high: priceRange.high },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="point" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={['dataMin - 100', 'dataMax + 100']}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`]}
          />
          <ReferenceLine 
            y={currentPrice} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="3 3"
            label={{ value: 'Current', position: 'right', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="none"
            fill="url(#colorRange)"
          />
          <Area
            type="monotone"
            dataKey="high"
            stroke="none"
            fill="url(#colorRange)"
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--foreground))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--foreground))', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="prediction" 
            stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))", r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;
