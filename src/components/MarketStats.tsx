import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { marketDataService } from "@/services/marketData";

const fetchMarketStats = async () => {
  await marketDataService.initialize();
  
  const [metrics, rankings] = await Promise.all([
    marketDataService.getGlobalMetrics().catch(() => null),
    marketDataService.getCryptoRankings(5).catch(() => []),
  ]);

  return {
    totalMarketCap: metrics?.totalMarketCap || 2100000000000,
    totalVolume24h: metrics?.totalVolume24h || 84200000000,
    btcDominance: metrics?.btcDominance || 42.1,
    marketCapChange: 2.4,
    volumeChange: 5.1,
    dominanceChange: -0.8,
  };
};

const MarketStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['marketStats'],
    queryFn: fetchMarketStats,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatLargeNumber(stats?.totalMarketCap || 0)}</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {stats?.marketCapChange.toFixed(1)}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatLargeNumber(stats?.totalVolume24h || 0)}</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {stats?.volumeChange.toFixed(1)}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">{stats?.btcDominance.toFixed(1)}%</p>
        <span className={`text-sm flex items-center gap-1 ${(stats?.dominanceChange || 0) >= 0 ? 'text-success' : 'text-warning'}`}>
          {(stats?.dominanceChange || 0) >= 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {Math.abs(stats?.dominanceChange || 0).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;