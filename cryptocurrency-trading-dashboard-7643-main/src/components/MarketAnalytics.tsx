import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, AlertCircle, Share, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fetchMarketAnalytics = async () => {
  // Mock data - in production, use real market analytics API
  return {
    strongest: [
      { currency: 'USD', change: 0.45, reason: 'Fed hawkish stance' },
      { currency: 'CHF', change: 0.32, reason: 'Safe haven demand' },
      { currency: 'AUD', change: 0.28, reason: 'Commodity rally' }
    ],
    weakest: [
      { currency: 'JPY', change: -0.52, reason: 'BoJ dovish policy' },
      { currency: 'EUR', change: -0.38, reason: 'ECB concerns' },
      { currency: 'GBP', change: -0.24, reason: 'Brexit uncertainty' }
    ],
    volatility: [
      { currency: 'BTC', level: 'High', value: 3.2 },
      { currency: 'ETH', level: 'High', value: 2.8 },
      { currency: 'GBP', level: 'Medium', value: 1.4 },
      { currency: 'EUR', level: 'Low', value: 0.8 }
    ],
    sessions: {
      current: 'London',
      status: 'Open',
      nextOpen: 'New York',
      timeToNext: '2h 15m'
    }
  };
};

const MarketAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['marketAnalytics'],
    queryFn: fetchMarketAnalytics,
    refetchInterval: 30000,
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

      {/* Strongest Currencies */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          Strongest Today
        </h4>
        <div className="space-y-2">
          {data?.strongest.map((item, index) => (
            <div key={item.currency} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded">
                  {index + 1}
                </span>
                <span className="font-medium text-sm">{item.currency}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-success">+{item.change}%</div>
                <div className="text-xs text-muted-foreground">{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Currencies */}
      <div className="glass-card p-4 rounded-lg animate-fade-in">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-warning" />
          Weakest Today
        </h4>
        <div className="space-y-2">
          {data?.weakest.map((item, index) => (
            <div key={item.currency} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                  {index + 1}
                </span>
                <span className="font-medium text-sm">{item.currency}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-warning">{item.change}%</div>
                <div className="text-xs text-muted-foreground">{item.reason}</div>
              </div>
            </div>
          ))}
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
                <span className="text-xs text-muted-foreground">{item.value}%</span>
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