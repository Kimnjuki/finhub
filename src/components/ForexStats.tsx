import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchForexStats = async () => {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ForexStats = () => {
  const { data: forexData, isLoading } = useQuery({
    queryKey: ['forexStats'],
    queryFn: fetchForexStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const majorPairs = [
    { pair: 'EUR/USD', rate: forexData?.rates?.EUR ? (1 / forexData.rates.EUR).toFixed(4) : '0.0000', change: -0.12 },
    { pair: 'GBP/USD', rate: forexData?.rates?.GBP ? (1 / forexData.rates.GBP).toFixed(4) : '0.0000', change: 0.08 },
    { pair: 'USD/JPY', rate: forexData?.rates?.JPY?.toFixed(2) || '0.00', change: 0.15 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      {majorPairs.map((pair, index) => (
        <div key={pair.pair} className="glass-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{pair.pair}</h3>
            <TrendingUpIcon className={`w-4 h-4 ${pair.change >= 0 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="text-2xl font-semibold mt-2">{pair.rate}</p>
          <span className={`text-sm flex items-center gap-1 ${pair.change >= 0 ? 'text-success' : 'text-warning'}`}>
            {pair.change >= 0 ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(pair.change)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default ForexStats;