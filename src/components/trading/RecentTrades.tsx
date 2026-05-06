import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Trade {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

interface RecentTradesProps {
  symbol: string;
}

export const RecentTrades = ({ symbol }: RecentTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsSymbol = symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@trade`);

    ws.onopen = () => {
      console.log('Trades WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        const newTrade: Trade = {
          id: data.t.toString(),
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          time: data.T,
          isBuyerMaker: data.m,
        };

        setTrades((prevTrades) => {
          const updated = [newTrade, ...prevTrades];
          return updated.slice(0, 50); // Keep only last 50 trades
        });
      } catch (error) {
        console.error('Error parsing trade data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Trades WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Trades WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  if (!isConnected || trades.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      
      <div className="grid grid-cols-3 text-xs text-muted-foreground font-semibold pb-2 border-b mb-2">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Time</div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-0.5">
          {trades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-3 text-xs py-1.5 hover:bg-muted/50 transition-colors">
              <div className={`font-mono font-semibold ${trade.isBuyerMaker ? 'text-red-500' : 'text-green-500'}`}>
                {trade.price.toFixed(2)}
              </div>
              <div className="text-right font-mono">{trade.quantity.toFixed(6)}</div>
              <div className="text-right text-muted-foreground">
                {new Date(trade.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
