import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, AlertCircle, Share, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marketDataService } from "@/services/marketData";

interface CurrencyStrength {
  currency: string;
  change: number;
  reason: string;
}

interface VolatilityItem {
  currency: string;
  level: string;
  value: number;
}

interface SessionInfo {
  current: string;
  status: string;
  nextOpen: string;
  timeToNext: string;
}

interface MarketAnalyticsData {
  strongest: CurrencyStrength[];
  weakest: CurrencyStrength[];
  volatility: VolatilityItem[];
  sessions: SessionInfo;
}

const fetchMarketAnalytics = async (): Promise<MarketAnalyticsData> => {
  // Initialize the market data service
  await marketDataService.initialize();
  
  // Fetch real data from multiple sources
  const [indices, rankings, metrics] = await Promise.all([
    marketDataService.getMarketIndices().catch(() => []),
    marketDataService.getCryptoRankings(10).catch(() => []),
    marketDataService.getGlobalMetrics().catch(() => null),
  ]);

  const volatilityItems: VolatilityItem[] = [];
  
  // Add crypto volatility data from real rankings
  if (rankings.length > 0) {
    rankings.slice(0, 4).forEach(r => {
      const absChange = Math.abs(r.change24h || 0);
      let level: string;
      if (absChange > 5) level = 'High';
      else if (absChange > 2) level = 'Medium';
      else level = 'Low';
      volatilityItems.push({
        currency: r.symbol,
        level,
        value: absChange,
      });
    });
  }

  // Determine strongest/weakest from real data
  const strongest: CurrencyStrength[] = [];
  const weakest: CurrencyStrength[] = [];

  // Use index performance data
  if (indices.length > 0) {
    const sortedIndices = [...indices].sort((a, b) => b.changePercent - a.changePercent);
    
    const indexNames: Record<string, string> = {
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      '^DJI': 'Dow Jones',
      '^VIX': 'VIX',
      '^FTSE': 'FTSE 100',
      '^N225': 'Nikkei 225',
    };

    sortedIndices.slice(0, 3).forEach(idx => {
      if (idx.changePercent > 0) {
        strongest.push({
          currency: indexNames[idx.symbol] || idx.name,
          change: idx.changePercent,
          reason: `Index up ${idx.changePercent.toFixed(2)}%`,
        });
      }
    });

    sortedIndices.slice(-3).forEach(idx => {
      if (idx.changePercent < 0) {
        weakest.push({
          currency: indexNames[idx.symbol] || idx.name,
          change: idx.changePercent,
          reason: `Index down ${Math.abs(idx.changePercent).toFixed(2)}%`,
        });
      }
    });
  }

  // Use crypto rankings to fill in gaps
  if (rankings.length > 0) {
    const sortedRankings = [...rankings].sort((a, b) => (b.change24h || 0) - (a.change24h || 0));
    
    sortedRankings.slice(0, 3).forEach(r => {
      if (r.change24h > 0 && strongest.length < 3) {
        strongest.push({
          currency: r.symbol,
          change: r.change24h || 0,
          reason: `Crypto up ${(r.change24h || 0).toFixed(2)}% (24h)`,
        });
      }
    });

    sortedRankings.slice(-3).forEach(r => {
      if (r.change24h < 0 && weakest.length < 3) {
        weakest.push({
          currency: r.symbol,
          change: r.change24h || 0,
          reason: `Crypto down ${Math.abs(r.change24h || 0).toFixed(2)}% (24h)`,
        });
      }
    });
  }

  // Default session info
  const sessions: SessionInfo = {
    current: 'Global',
    status: 'Open',
    nextOpen: 'Asian',
    timeToNext: 'Ongoing',
  };

  // Determine current trading session based on time
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 6) {
    sessions.current = 'Asian';
    sessions.status = hour >= 1 ? 'Open' : 'Closed';
    sessions.nextOpen = 'London';
    sessions.timeToNext = `${(7 - hour)}h`;
  } else if (hour >= 6 && hour < 12) {
    sessions.current = 'European / London';
    sessions.status = 'Open';
    sessions.nextOpen = 'New York';
    sessions.timeToNext = `${(13 - hour)}h ${30 - new Date().getUTCMinutes()}m`;
  } else {
    sessions.current = 'New York / Americas';
    sessions.status = 'Open';
    sessions.nextOpen = 'Asian';
    sessions.timeToNext = `${(24 - hour + 1)}h`;
  }

  return {
    strongest: strongest.slice(0, 3),
    weakest: weakest.slice(0, 3),
    volatility: volatilityItems.slice(0, 6),
    sessions,
  };
};

const MarketAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['marketAnalytics'],
    queryFn: fetchMarketAnalytics,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getVolatilityColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Medium':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'Low':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trading Session */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Trading Session
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{data?.sessions.current} Market</span>
            <Badge className="bg-success/20 text-success border-success/30">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                {data?.sessions.status}
              </div>
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Next: {data?.sessions.nextOpen} opens in {data?.sessions.timeToNext}
          </div>
        </div>
      </div>

      {/* Strongest Markets */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          Strongest Today
        </h4>
        <div className="space-y-2">
          {data?.strongest.length ? (
            data.strongest.map((item, index) => (
              <div key={item.currency} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{item.currency}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-success">+{item.change.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">{item.reason}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-2">Loading live data...</p>
          )}
        </div>
      </div>

      {/* Weakest Markets */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-warning" />
          Weakest Today
        </h4>
        <div className="space-y-2">
          {data?.weakest.length ? (
            data.weakest.map((item, index) => (
              <div key={item.currency} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{item.currency}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-warning">{item.change.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">{item.reason}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-2">Loading live data...</p>
          )}
        </div>
      </div>

      {/* Volatility Monitor */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Volatility Monitor
        </h4>
        <div className="space-y-2">
          {data?.volatility.map((item) => (
            <div key={item.currency} className="flex items-center justify-between">
              <span className="font-medium text-sm">{item.currency}</span>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getVolatilityColor(item.level)}`}>
                  {item.level}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.value.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            onClick={() => window.alert('Price Alert feature coming soon! Get notified when your target prices are reached.')}
          >
            <Bell className="w-3 h-3 mr-2" />
            Set Price Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start hover:bg-success/10 hover:border-success/30 transition-all duration-200"
            onClick={() => {
              const data = JSON.stringify({
                timestamp: new Date().toISOString(),
                marketData: 'Exported market analytics data'
              }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'market-analytics.json';
              a.click();
            }}
          >
            <Download className="w-3 h-3 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Share className="w-3 h-3 mr-2" />
            Share Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalytics;