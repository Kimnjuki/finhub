import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoMarketsTab } from './CryptoMarketsTab';
import { Fortune500Tab } from './Fortune500Tab';
import { NvidiaAIPanel } from '@/components/NvidiaAIPanel';
import { Bitcoin, TrendingUp, BarChart3, Star, Brain } from 'lucide-react';

export const MarketTabs: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Bitcoin className="w-4 h-4" />
            Crypto Markets
          </TabsTrigger>
          <TabsTrigger value="stocks" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Fortune 500
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Watchlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <CryptoMarketsTab />
        </TabsContent>

        <TabsContent value="stocks">
          <Fortune500Tab />
        </TabsContent>

        <TabsContent value="analysis">
          <div className="py-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">NVIDIA AI Market Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time AI-powered crypto & forex analysis using live market data
                </p>
              </div>
            </div>
            <NvidiaAIPanel />
          </div>
        </TabsContent>

        <TabsContent value="watchlist">
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Watchlist</h3>
            <p className="text-muted-foreground">Create and manage your personalized watchlist</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
