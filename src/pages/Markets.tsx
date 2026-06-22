import React, { useState } from 'react';
import { MarketTabs } from '@/components/markets/MarketTabs';
import SEOHead from '@/components/SEOHead';
import { InstrumentTicker } from '@/components/market/InstrumentTicker';
import { WatchlistPanel } from '@/components/market/WatchlistPanel';
import { MultiSourceSelector } from '@/components/market/MultiSourceSelector';
import { MultiSourceMarketProvider, useMultiSourceMarket } from '@/contexts/MultiSourceMarketProvider';
import { useMarketNews, useCryptoRankings, useGlobalMarketMetrics, useMarketIndices, useTrendingCoins, useGainersLosers } from '@/services/marketData/hooks/useMultiSourcePrice';
import { AssetClass, DataSource, CryptoRanking, GlobalMarketMetrics, MarketIndex } from '@/services/marketData/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, BarChart3, Globe, Newspaper, ArrowUpDown, 
  RefreshCw, Activity, Layout, CandlestickChart, Signal, MessageCircle,
  DollarSign, Flame, PieChart, LineChart as LineChartIcon, Grid
} from 'lucide-react';
import { TradingViewCandlestick } from '@/components/charts/TradingViewCandlestick';
import { AdvancedDepthChart } from '@/components/charts/AdvancedDepthChart';
import { MultiChartLayout } from '@/components/charts/MultiChartLayout';
import TechnicalSignals from '@/components/TechnicalSignals';
import SocialSentiment from '@/components/SocialSentiment';
import CurrencyHeatMap from '@/components/CurrencyHeatMap';
import MarketAnalytics from '@/components/MarketAnalytics';
import ForexList from '@/components/ForexList';
import MarketStats from '@/components/MarketStats';
import CryptoList from '@/components/CryptoList';
import CurrencySelector from '@/components/market/CurrencySelector';
import PriceAlertBadge from '@/components/market/PriceAlertBadge';
import OrderBookDepth from '@/components/market/OrderBookDepth';

const MarketsContent: React.FC = () => {
  const { globalMetrics, marketIndices, topRankings, marketNews, refreshAll } = useMultiSourceMarket();
  const [symbols, setSymbols] = useState<string[]>(['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD']);
  const [selectedSources, setSelectedSources] = useState<DataSource[]>(['coinbase', 'kraken', 'polygon', 'yahoo']);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSourceToggle = (source: DataSource) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1e12) return `$${(price / 1e12).toFixed(2)}T`;
    if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
    if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
            <p className="text-muted-foreground mt-1">
              Real-time data from {selectedSources.length} providers • Multi-source aggregation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PriceAlertBadge />
            <CurrencySelector />
            <button 
              onClick={refreshAll} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Global Market Metrics */}
        {globalMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <MetricCard label="Total Market Cap" value={formatPrice(globalMetrics.totalMarketCap)} icon={<Globe className="h-4 w-4" />} />
            <MetricCard label="24h Volume" value={formatPrice(globalMetrics.totalVolume24h)} icon={<Activity className="h-4 w-4" />} />
            <MetricCard label="BTC Dominance" value={`${globalMetrics.btcDominance.toFixed(1)}%`} icon={<BarChart3 className="h-4 w-4" />} />
            <MetricCard label="ETH Dominance" value={`${globalMetrics.ethDominance.toFixed(1)}%`} icon={<BarChart3 className="h-4 w-4" />} />
            <MetricCard label="DeFi Market Cap" value={formatPrice(globalMetrics.defiMarketCap)} />
            <MetricCard label="Stablecoins" value={formatPrice(globalMetrics.stablecoinMarketCap)} />
            <MetricCard label="Cryptos" value={globalMetrics.totalCryptocurrencies.toLocaleString()} />
            <MetricCard label="Exchanges" value={globalMetrics.totalExchanges.toLocaleString()} />
          </div>
        )}

        {/* Market Indices */}
        {marketIndices.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {marketIndices.map(index => (
              <div key={index.symbol} className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <div className="text-xs text-muted-foreground">{index.name}</div>
                  <div className="font-semibold">{index.price.toLocaleString()}</div>
                </div>
                <div className={`text-sm font-medium ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-10 w-full max-w-7xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="depth">Depth</TabsTrigger>
            <TabsTrigger value="multi">Multi</TabsTrigger>
            <TabsTrigger value="wallet">Watchlist</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Multi-Source Price Feed
                    </CardTitle>
                    <CardDescription>
                      Aggregated prices from {selectedSources.length} sources using median + VWAP
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {symbols.map(s => (
                        <InstrumentTicker key={s} symbol={s} size="large" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data Sources</CardTitle>
                    <CardDescription>Toggle data providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MultiSourceSelector 
                      selectedSources={selectedSources}
                      onSourceToggle={handleSourceToggle}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Market Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketStats />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Top Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Top Cryptocurrencies
                </CardTitle>
                <CardDescription>Real-time rankings from CoinMarketCap</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-right py-3 px-2">Price</th>
                        <th className="text-right py-3 px-2">Market Cap</th>
                        <th className="text-right py-3 px-2">24h Vol</th>
                        <th className="text-right py-3 px-2">1h</th>
                        <th className="text-right py-3 px-2">24h</th>
                        <th className="text-right py-3 px-2">7d</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRankings.slice(0, 10).map((coin) => (
                        <tr key={coin.rank} className="border-b border-border/20 hover:bg-muted/10">
                          <td className="py-3 px-2 text-muted-foreground">{coin.rank}</td>
                          <td className="py-3 px-2 font-medium">{coin.name} <span className="text-muted-foreground">{coin.symbol}</span></td>
                          <td className="text-right py-3 px-2 font-mono">${coin.price.toLocaleString()}</td>
                          <td className="text-right py-3 px-2">${(coin.marketCap / 1e9).toFixed(2)}B</td>
                          <td className="text-right py-3 px-2">${(coin.volume24h / 1e9).toFixed(2)}B</td>
                          <td className={`text-right py-3 px-2 ${coin.change1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(2)}%
                          </td>
                          <td className={`text-right py-3 px-2 ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </td>
                          <td className={`text-right py-3 px-2 ${coin.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.change7d >= 0 ? '+' : ''}{coin.change7d.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crypto Tab */}
          <TabsContent value="crypto" className="space-y-6">
            <CryptoList />
          </TabsContent>

          {/* Forex Tab */}
          <TabsContent value="forex" className="space-y-6">
            <ForexList />
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <TechnicalSignals />
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <SocialSentiment />
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-6">
            <CurrencyHeatMap />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <MarketAnalytics />
          </TabsContent>

          {/* Charts Tab - Production-Grade TradingView Lightweight Charts */}
          <TabsContent value="charts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CandlestickChart className="h-5 w-5" />
                  Advanced Chart
                </CardTitle>
                <CardDescription>
                  Real-time candlestick chart with multiple timeframes from Binance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradingViewCandlestick
                  symbol="BTCUSDT"
                  interval="1h"
                  height={500}
                  showVolume={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Depth Tab - Real-time Order Book Visualization */}
          <TabsContent value="depth" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OrderBookDepth symbol="BTCUSDT" />
              <OrderBookDepth symbol="ETHUSDT" />
            </div>
          </TabsContent>

          {/* Multi-Chart Tab */}
          <TabsContent value="multi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Multi-Chart Layout
                </CardTitle>
                <CardDescription>
                  Split-screen charting with multiple pairs, timeframes, and resizable panels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiChartLayout />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet/Watchlist Tab */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Multi-source aggregated watchlist</CardDescription>
              </CardHeader>
              <CardContent>
                <WatchlistPanel symbols={symbols} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MultiSourceSelector 
                selectedSources={selectedSources}
                onSourceToggle={handleSourceToggle}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Aggregation Details</CardTitle>
                  <CardDescription>How multi-source data works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">Source Selection</h4>
                    <p className="text-sm text-muted-foreground">
                      The system automatically selects the best available sources based on data quality:
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• <span className="text-purple-400">Institutional</span> — CoinDesk, Polygon.io (highest quality)</li>
                      <li>• <span className="text-blue-400">Exchange</span> — Coinbase, Kraken, Binance (real-time)</li>
                      <li>• <span className="text-green-400">Aggregated</span> — CoinMarketCap, CoinGecko (broad coverage)</li>
                      <li>• <span className="text-yellow-400">Reference</span> — Yahoo Finance, Finnhub, Alpha Vantage (fallback)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">Price Aggregation</h4>
                    <p className="text-sm text-muted-foreground">
                      Prices use median across all available sources with IQR outlier rejection.
                      VWAP used when volume data is available. Confidence scored 1-3 sources.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Market News
                </CardTitle>
                <CardDescription>Aggregated from Finnhub & Yahoo Finance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketNews.slice(0, 10).map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" 
                       className="block p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt="" className="w-full h-32 object-cover rounded mb-2" />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                        </div>
                        {item.sentiment && (
                          <Badge variant={item.sentiment === 'bullish' ? 'default' : item.sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                            {item.sentiment}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span>{item.sourceName}</span>
                        <span>·</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        {item.symbols.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{item.symbols.slice(0, 3).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>Full Rankings</CardTitle>
                <CardDescription>Top 50 cryptocurrencies by market cap</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 px-2">#</th>
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-right py-3 px-2">Price</th>
                        <th className="text-right py-3 px-2">Market Cap</th>
                        <th className="text-right py-3 px-2">24h Vol</th>
                        <th className="text-right py-3 px-2">Circulating Supply</th>
                        <th className="text-right py-3 px-2">24h %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRankings.map((coin) => (
                        <tr key={coin.rank} className="border-b border-border/20 hover:bg-muted/10">
                          <td className="py-3 px-2 text-muted-foreground">{coin.rank}</td>
                          <td className="py-3 px-2 font-medium">{coin.name} <span className="text-muted-foreground">{coin.symbol}</span></td>
                          <td className="text-right py-3 px-2 font-mono">${coin.price.toLocaleString()}</td>
                          <td className="text-right py-3 px-2">${(coin.marketCap / 1e9).toFixed(2)}B</td>
                          <td className="text-right py-3 px-2">${(coin.volume24h / 1e9).toFixed(2)}B</td>
                          <td className="text-right py-3 px-2">{coin.circulatingSupply ? coin.circulatingSupply.toLocaleString() : 'N/A'}</td>
                          <td className={`text-right py-3 px-2 font-medium ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending">
            <Card>
              <CardHeader>
                <CardTitle>Trending on CoinMarketCap</CardTitle>
                <CardDescription>Most viewed cryptocurrencies</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendingList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function MetricCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/20 border border-border/30">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function TrendingList() {
  const { coins, loading } = useTrendingCoins(10);
  
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading trending coins...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {coins.map((coin, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">#{i + 1}</span>
            <div>
              <div className="font-medium">{coin.name}</div>
              <div className="text-xs text-muted-foreground">{coin.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono">${coin.price.toLocaleString()}</div>
            <div className={`text-xs ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Wrap with provider
const Markets: React.FC = () => {
  return (
    <MultiSourceMarketProvider>
      <MarketsContent />
    </MultiSourceMarketProvider>
  );
};

export default Markets;