import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const fetchCurrencyStrength = async () => {
  // Mock data for currency strength - in production, use real API
  return {
    currencies: [
      { code: 'USD', name: 'US Dollar', change: 0.25, strength: 'strong' },
      { code: 'EUR', name: 'Euro', change: -0.18, strength: 'weak' },
      { code: 'GBP', name: 'British Pound', change: 0.12, strength: 'neutral' },
      { code: 'JPY', name: 'Japanese Yen', change: -0.31, strength: 'weak' },
      { code: 'CAD', name: 'Canadian Dollar', change: 0.08, strength: 'neutral' },
      { code: 'AUD', name: 'Australian Dollar', change: 0.19, strength: 'strong' },
      { code: 'CHF', name: 'Swiss Franc', change: -0.05, strength: 'neutral' },
      { code: 'CNY', name: 'Chinese Yuan', change: 0.15, strength: 'strong' },
      { code: 'ZAR', name: 'South African Rand', change: -0.22, strength: 'weak' },
      { code: 'NGN', name: 'Nigerian Naira', change: -0.45, strength: 'weak' },
      { code: 'KES', name: 'Kenyan Shilling', change: 0.03, strength: 'neutral' },
      { code: 'EGP', name: 'Egyptian Pound', change: -0.12, strength: 'weak' }
    ]
  };
};

const CurrencyHeatMap = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['currencyStrength'],
    queryFn: fetchCurrencyStrength,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Currency Strength Heat Map</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStrengthColor = (change: number) => {
    if (change > 0.1) return 'bg-gradient-to-br from-success/80 to-success border-success/50';
    if (change < -0.1) return 'bg-gradient-to-br from-warning/80 to-warning border-warning/50';
    return 'bg-gradient-to-br from-muted/80 to-muted border-muted/50';
  };

  const getTextColor = (change: number) => {
    if (change > 0.1) return 'text-success-foreground';
    if (change < -0.1) return 'text-warning-foreground';
    return 'text-muted-foreground';
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-primary/20 animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card/80 to-primary/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-vogun text-gradient-green">Currency Strength Heat Map</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-primary font-medium">LIVE</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-success/80 to-success rounded"></div>
          <span className="text-xs text-muted-foreground">Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-muted/80 to-muted rounded"></div>
          <span className="text-xs text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-warning/80 to-warning rounded"></div>
          <span className="text-xs text-muted-foreground">Weak</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {data?.currencies.map((currency, index) => (
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
            {/* Glow effect for strong currencies */}
            {Math.abs(currency.change) > 0.2 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-radial from-primary/20 to-transparent opacity-50 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Side Ad Space */}
      <div className="mt-4 p-3 bg-muted/20 border border-border/40 rounded-lg text-center">
        <span className="text-xs text-muted-foreground">Sponsored Content - Currency Analysis Tools</span>
      </div>
    </div>
  );
};

export default CurrencyHeatMap;