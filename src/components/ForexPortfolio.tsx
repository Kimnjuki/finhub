import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";

// Mock portfolio data since we don't have real portfolio API
const mockPortfolioData = [
  { date: '2024-01-01', value: 10000 },
  { date: '2024-01-02', value: 10150 },
  { date: '2024-01-03', value: 9980 },
  { date: '2024-01-04', value: 10250 },
  { date: '2024-01-05', value: 10100 },
  { date: '2024-01-06', value: 10350 },
  { date: '2024-01-07', value: 10420 },
];

const ForexPortfolio = () => {
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['forexPortfolio'],
    queryFn: () => Promise.resolve(mockPortfolioData),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading portfolio...</div>;
  }

  const currentValue = portfolioData?.[portfolioData.length - 1]?.value || 0;
  const initialValue = portfolioData?.[0]?.value || 0;
  const totalReturn = ((currentValue - initialValue) / initialValue) * 100;

  return (
    <div className="glass-card p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Forex Portfolio Performance</h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-semibold">${currentValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Return</p>
            <p className={`text-2xl font-semibold ${totalReturn >= 0 ? 'text-success' : 'text-warning'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3935" />
            <XAxis 
              dataKey="date" 
              stroke="#E6E4DD"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="#E6E4DD"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#3A3935', 
                border: '1px solid #605F5B',
                borderRadius: '8px',
                color: '#FAFAF8'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8989DE" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForexPortfolio;