import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, BarChart3, RefreshCw, Signal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicalSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 1-10
  indicators: {
    rsi: { value: number; signal: string };
    macd: { value: string; signal: string };
    ma: { value: string; signal: string };
    support: number;
    resistance: number;
  };
  timeframe: string;
  confidence: number;
  lastUpdate: string;
  price: number;
  change24h: number;
}

const fetchTechnicalSignals = async (): Promise<TechnicalSignal[]> => {
  // Simulate API call with realistic technical analysis data
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const symbols = [
    { symbol: 'EUR/USD', price: 1.0756, change24h: 0.23 },
    { symbol: 'GBP/USD', price: 1.2634, change24h: -0.18 },
    { symbol: 'USD/JPY', price: 149.85, change24h: 0.45 },
    { symbol: 'AUD/USD', price: 0.6523, change24h: -0.31 },
    { symbol: 'BTC/USD', price: 43250, change24h: 2.8 },
    { symbol: 'ETH/USD', price: 2650, change24h: 1.9 },
    { symbol: 'XRP/USD', price: 0.6234, change24h: -1.2 },
    { symbol: 'SOL/USD', price: 98.45, change24h: 4.2 }
  ];

  return symbols.map(({ symbol, price, change24h }) => {
    const rsiValue = Math.floor(Math.random() * 100);
    const rsiSignal = rsiValue > 70 ? 'SELL' : rsiValue < 30 ? 'BUY' : 'NEUTRAL';
    
    const macdSignal = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
    const maSignal = Math.random() > 0.6 ? 'ABOVE' : 'BELOW';
    
    // Determine overall signal based on indicators
    let overallSignal: 'BUY' | 'SELL' | 'NEUTRAL';
    let strength = Math.floor(Math.random() * 10) + 1;
    
    if (rsiSignal === 'BUY' && macdSignal === 'BULLISH' && maSignal === 'ABOVE') {
      overallSignal = 'BUY';
      strength = Math.max(strength, 7);
    } else if (rsiSignal === 'SELL' && macdSignal === 'BEARISH' && maSignal === 'BELOW') {
      overallSignal = 'SELL';
      strength = Math.max(strength, 7);
    } else {
      overallSignal = Math.random() > 0.33 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : 'NEUTRAL';
    }

    const support = price * (0.98 - Math.random() * 0.02);
    const resistance = price * (1.02 + Math.random() * 0.02);

    return {
      symbol,
      signal: overallSignal,
      strength,
      indicators: {
        rsi: { value: rsiValue, signal: rsiSignal },
        macd: { value: macdSignal === 'BULLISH' ? '+0.0023' : '-0.0018', signal: macdSignal },
        ma: { value: maSignal, signal: `Price ${maSignal.toLowerCase()} MA(20)` },
        support: Math.round(support * 10000) / 10000,
        resistance: Math.round(resistance * 10000) / 10000
      },
      timeframe: ['1H', '4H', '1D'][Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastUpdate: new Date().toLocaleTimeString(),
      price,
      change24h
    };
  });
};

const TechnicalSignals = () => {
  const { data: signals, isLoading, refetch } = useQuery({
    queryKey: ['technicalSignals'],
    queryFn: fetchTechnicalSignals,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'bg-success/20 text-success border-success/30';
      case 'SELL': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getStrengthBars = (strength: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-4 rounded-sm transition-all duration-300 ${
          i < strength
            ? strength >= 7
              ? 'bg-success'
              : strength >= 4
              ? 'bg-warning'
              : 'bg-destructive'
            : 'bg-muted'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-vogun">
            <Signal className="w-5 h-5" />
            Technical Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-vogun">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Signal className="w-5 h-5 text-primary" />
            </div>
            Technical Signals
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered trading signals updated every 30 seconds
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {signals?.map((signal, index) => (
          <div
            key={signal.symbol}
            className="p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg font-mono">{signal.symbol}</span>
                <Badge className={`flex items-center gap-1 ${getSignalColor(signal.signal)}`}>
                  {getSignalIcon(signal.signal)}
                  {signal.signal}
                </Badge>
                <div className="flex items-center gap-1">
                  {getStrengthBars(signal.strength)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono">
                  {signal.symbol.includes('USD') && !signal.symbol.includes('BTC') && !signal.symbol.includes('ETH') 
                    ? signal.price.toFixed(4) 
                    : signal.price.toLocaleString()}
                </div>
                <div className={`text-sm ${signal.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {signal.change24h >= 0 ? '+' : ''}{signal.change24h}%
                </div>
              </div>
            </div>
            
            {/* Technical Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-muted-foreground">RSI (14)</div>
                <div className="font-medium">
                  {signal.indicators.rsi.value}
                  <span className={`ml-1 ${
                    signal.indicators.rsi.signal === 'BUY' ? 'text-success' : 
                    signal.indicators.rsi.signal === 'SELL' ? 'text-destructive' : 'text-warning'
                  }`}>
                    {signal.indicators.rsi.signal}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">MACD</div>
                <div className="font-medium">
                  {signal.indicators.macd.value}
                  <span className={`ml-1 ${
                    signal.indicators.macd.signal === 'BULLISH' ? 'text-success' : 'text-destructive'
                  }`}>
                    {signal.indicators.macd.signal}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">Support</div>
                <div className="font-medium font-mono text-success">
                  {signal.indicators.support}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">Resistance</div>
                <div className="font-medium font-mono text-destructive">
                  {signal.indicators.resistance}
                </div>
              </div>
            </div>
            
            {/* Signal Details */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Timeframe: {signal.timeframe}</span>
                <span>Confidence: {signal.confidence}%</span>
                <span>Updated: {signal.lastUpdate}</span>
              </div>
              <Button size="sm" variant="ghost" className="text-xs hover:bg-primary/10">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analyze
              </Button>
            </div>
          </div>
        ))}
        
        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-xs text-warning/80">
            ⚠️ <strong>Risk Warning:</strong> Technical signals are for informational purposes only. 
            Always conduct your own analysis and never risk more than you can afford to lose.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalSignals;