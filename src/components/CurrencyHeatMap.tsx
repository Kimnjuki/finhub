import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { marketDataService } from "@/services/marketData";

interface CurrencyStrengthData {
  code: string;
  name: string;
  change: number;
  strength: 'strong' | 'weak' | 'neutral';
}

const fetchCurrencyStrength = async () => {
  await marketDataService.initialize();
  
  // Get crypto rankings for currency-like data
  const rankings = await marketDataService.getCryptoRankings(12).catch(() => []);
  const indices = await marketDataService.getMarketIndices().catch(() => []);
  const metrics = await marketDataService.getGlobalMetrics().catch(() => null);

  const currencies: CurrencyStrengthData[] = [];

  // Map crypto rankings to currency-like entries
  if (rankings.length > 0) {
    const cryptoCurrencies = [
      { code: 'BTC', name: 'Bitcoin' },
      { code: 'ETH', name: 'Ethereum' },
      { code: 'SOL', name: 'Solana' },
      { code: 'XRP', name: 'XRP' },
      { code: 'ADA', name: 'Cardano' },
      { code: 'DOGE', name: 'Dogecoin' },
      { code: 'DOT', name: 'Polkadot' },
      { code: 'AVAX', name: 'Avalanche' },
      { code: 'LINK', name: 'Chainlink' },
      { code: 'MATIC', name: 'Polygon' },
      { code: 'UNI', name: 'Uniswap' },
      { code: 'ATOM', name: 'Cosmos' },
    ];

    cryptoCurrencies.forEach(cc => {
      const ranking = rankings.find(r => r.symbol === cc.code);
      if (ranking) {
        const change = ranking.change24h || 0;
        let strength: 'strong' | 'weak' | 'neutral';
        if (change > 1) strength = 'strong';
        else if (change < -1) strength = 'weak';
        else strength = 'neutral';
        
        currencies.push({
          code: cc.code,
          name: cc.name,
          change,
          strength,
        });
      }
    });
  }

  return { currencies };
};

const CurrencyHeatMap = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['currencyStrength'],
    queryFn: fetchCurrencyStrength,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Crypto Strength Heat Map</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStrengthColor = (change: number) => {
    if (change > 1) return 'bg-gradient-to-br from-success/80 to-success border-success/50';
    if (change < -1) return 'bg-gradient-to-br from-warning/80 to-warning border-warning/50';
    return 'bg-gradient-to-br from-muted/80 to-muted border-muted/50';
  };

  const getTextColor = (change: number) => {
    if (change > 1) return 'text-success-foreground';
    if (change < -1) return 'text-warning-foreground';
    return 'text-muted-foreground';
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-primary/20 animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card/80 to-primary/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-vogun text-gradient-green">
          Crypto Strength Heat Map
          <span className="block text-xs text-muted-foreground font-normal mt-1">
            Live from Polygon + TwelveData + Alpha Vantage
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-primary font-medium">LIVE</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-success/80 to-success rounded"></div>
          <span className="text-xs text-muted-foreground">Strong (↑ {'>'}1%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-muted/80 to-muted rounded"></div>
          <span className="text-xs text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-warning/80 to-warning rounded"></div>
          <span className="text-xs text-muted-foreground">Weak (↓ {'>'}1%)</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {data?.currencies?.length ? (
          data.currencies.map((currency, index) => (
            <div
              key={currency.code}
              className={`relative p-4 rounded-xl border-2 transition-all duration-500 hover:scale-110 hover:shadow-2xl cursor-pointer transform ${getStrengthColor(currency.change)} hover:z-10`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-center relative z-10">
                <div className="font-bold text-base mb-1">{currency.code}</div>
                <div className={`text-xs mb-2 opacity-90 ${getTextColor(currency.change)}`}>
                  {currency.name}
                </div>
                <div className={`flex items-center justify-center text-sm font-bold ${getTextColor(currency.change)}`}>
                  {currency.change >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1 animate-bounce" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1 animate-bounce" />
                  )}
                  {Math.abs(currency.change).toFixed(2)}%
                </div>
              </div>
              {Math.abs(currency.change) > 2 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-radial from-primary/20 to-transparent opacity-50 animate-pulse"></div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading live data from connected APIs...
          </div>
        )}
      </div>
      
      {/* Side Ad Space */}
      <div className="mt-4 p-3 bg-muted/20 border border-border/40 rounded-lg text-center">
        <span className="text-xs text-muted-foreground">
          Data sources: Polygon.io, Twelve Data, Alpha Vantage, CoinGecko, Yahoo Finance
        </span>
      </div>
    </div>
  );
};

export default CurrencyHeatMap;