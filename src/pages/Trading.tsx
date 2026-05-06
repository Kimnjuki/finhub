import { useState } from 'react';
import { TradingChartContainer } from '@/components/trading/TradingChartContainer';
import { OrderEntryForm } from '@/components/trading/OrderEntryForm';
import { OrderBook } from '@/components/trading/OrderBook';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { TradeHistory } from '@/components/trading/TradeHistory';
import Navigation from '@/components/Navigation';
import SEOHead from '@/components/SEOHead';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Trading = () => {
  const [currentPrice] = useState(43250.75);
  const [selectedSymbol] = useState('BTCUSDT');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Advanced Trading Chart | FinHub Africa"
        description="Professional TradingView-style charts with real-time data, multiple timeframes, and advanced indicators for cryptocurrency trading."
      />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Advanced Trading</h1>
          <p className="text-muted-foreground">
            Professional trading charts with real-time data and multiple timeframes
          </p>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel - Order Book & Trades */}
          <div className="col-span-3 space-y-4">
            <Tabs defaultValue="orderbook">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>
              <TabsContent value="orderbook">
                <OrderBook symbol={selectedSymbol} />
              </TabsContent>
              <TabsContent value="trades">
                <RecentTrades symbol={selectedSymbol} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Center Panel - Chart */}
          <div className="col-span-6">
            <TradingChartContainer />
          </div>

          {/* Right Panel - Order Entry */}
          <div className="col-span-3">
            <OrderEntryForm symbol={selectedSymbol} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Bottom Panel - Trade History */}
        <div className="mt-6">
          <TradeHistory />
        </div>
      </main>
    </div>
  );
};

export default Trading;
