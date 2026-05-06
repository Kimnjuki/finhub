import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { CryptoAsset } from "@/hooks/useCryptoPrice";
import { useMarketData } from "@/contexts/MarketDataContext";
import { Badge } from "@/components/ui/badge";

interface PriceTickerCardProps {
  crypto: CryptoAsset;
}

const PriceTickerCard = ({ crypto }: PriceTickerCardProps) => {
  const { convertPrice, getCurrencySymbol, selectedCurrency } = useMarketData();
  
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const convertedPrice = convertPrice(crypto.current_price);
  const currencySymbol = getCurrencySymbol(selectedCurrency);

  // Format sparkline data for chart
  const sparklineData = crypto.sparkline_in_7d?.price
    ? crypto.sparkline_in_7d.price.slice(-24).map((price, index) => ({
        index,
        price,
      }))
    : [];

  return (
    <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={crypto.image} 
              alt={crypto.name} 
              className="w-10 h-10 rounded-full ring-2 ring-primary/20"
            />
            <div>
              <h3 className="font-semibold text-base">{crypto.symbol.toUpperCase()}</h3>
              <p className="text-xs text-muted-foreground">{crypto.name}</p>
            </div>
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </Badge>
        </div>

        <div className="mb-3">
          <p className="text-2xl font-bold text-primary">
            {currencySymbol}
            {convertedPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vol: ${(crypto.total_volume / 1e9).toFixed(2)}B
          </p>
        </div>

        {sparklineData.length > 0 && (
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>24h Change</span>
          </div>
          <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {currencySymbol}
            {Math.abs(convertPrice(crypto.price_change_24h)).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTickerCard;
