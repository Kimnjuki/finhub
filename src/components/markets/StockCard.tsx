import React, { useState } from 'react';
import { Stock, TradingSignal } from '@/types/stock.types';
import { TradingSignal as TradingSignalComponent } from './TradingSignal';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockChart } from './StockChart';
import { Button } from '@/components/ui/button';

interface StockCardProps {
  stock: Stock;
  signal: TradingSignal;
  logo?: string;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, signal, logo }) => {
  const [showChart, setShowChart] = useState(false);
  const isPositive = stock.change >= 0;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{logo || '📈'}</span>
            <div>
              <CardTitle className="text-lg">{stock.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Market Cap</p>
            <p className="font-semibold">{formatNumber(stock.marketCap)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">P/E Ratio</p>
            <p className="font-semibold">{stock.peRatio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-semibold">{formatNumber(stock.volume)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">52W Range</p>
            <p className="font-semibold text-xs">
              ${stock.week52Low.toFixed(0)} - ${stock.week52High.toFixed(0)}
            </p>
          </div>
        </div>
        
        <TradingSignalComponent signal={signal} />
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Chart
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show Interactive Chart
              </>
            )}
          </Button>
          
          <Button className="w-full">
            Trade Now
          </Button>
        </div>
      </CardContent>
      
      {showChart && (
        <CardContent className="pt-0">
          <StockChart symbol={stock.symbol} name={stock.name} />
        </CardContent>
      )}
    </Card>
  );
};
