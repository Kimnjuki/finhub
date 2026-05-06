import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DollarSign, 
  BarChart3, 
  Globe, 
  Calculator,
  Zap,
  Shield,
  Target
} from "lucide-react";
import CryptoChart from "@/components/CryptoChart";
import ForexChart from "@/components/ForexChart";
import SmartCalculator from "@/components/SmartCalculator";
import TechnicalSignals from "@/components/TechnicalSignals";

const MobileDashboard = () => {
  const [activeView, setActiveView] = useState("overview");

  const quickStats = [
    { label: "BTC", value: "$67,234", change: "+2.4%", trend: "up" },
    { label: "EUR/USD", value: "1.0891", change: "-0.1%", trend: "down" },
    { label: "Gold", value: "$2,045", change: "+1.2%", trend: "up" },
    { label: "Oil", value: "$85.50", change: "+2.3%", trend: "up" },
  ];

  const cryptoList = [
    { symbol: "BTC", name: "Bitcoin", price: 67234, change: 2.4 },
    { symbol: "ETH", name: "Ethereum", price: 3456, change: 1.8 },
    { symbol: "SOL", name: "Solana", price: 145, change: -0.5 },
    { symbol: "ADA", name: "Cardano", price: 0.52, change: 3.2 },
  ];

  const forexPairs = [
    { pair: "EUR/USD", price: 1.0891, change: -0.1 },
    { pair: "GBP/USD", price: 1.2654, change: 0.3 },
    { pair: "USD/JPY", price: 148.25, change: 0.8 },
    { pair: "AUD/USD", price: 0.6523, change: -0.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pt-20 lg:pt-0">
        <div className="floating">
          <h1 className="text-4xl lg:text-6xl font-bold mb-3 text-gradient animate-bounce-in">
            Trading Hub
          </h1>
          <p className="text-muted-foreground text-base lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Unified crypto and forex trading dashboard with premium analytics
          </p>
        </div>
        
        {/* Enhanced Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 glass-card micro-bounce">
            <div className="status-indicator">
              <Zap className="h-4 w-4" />
            </div>
            Live Data
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 glass-card micro-bounce">
            <Shield className="h-4 w-4 text-success" />
            Bank-Grade Security
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 glass-card micro-bounce">
            <Target className="h-4 w-4 text-accent" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Quick Stats - Premium Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="glass-card card-hover micro-bounce">
            <CardContent className="p-5">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-muted-foreground tracking-wide">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-gradient">{stat.value}</p>
                <div className={`flex items-center justify-center gap-1.5 text-sm font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up" 
                    ? "text-success bg-success/10" 
                    : "text-destructive bg-destructive/10"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card p-1 h-12">
          <TabsTrigger value="overview" className="text-sm font-medium micro-bounce data-[state=active]:premium-card data-[state=active]:text-primary-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-sm font-medium micro-bounce data-[state=active]:premium-card data-[state=active]:text-primary-foreground">
            Charts
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-sm font-medium micro-bounce data-[state=active]:premium-card data-[state=active]:text-primary-foreground">
            Signals
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-sm font-medium micro-bounce data-[state=active]:premium-card data-[state=active]:text-primary-foreground">
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-8">
          {/* Enhanced Crypto List */}
          <Card className="glass-card card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 premium-card rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-gradient">Top Cryptocurrencies</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoList.map((crypto, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl glass-card micro-bounce">
                  <div>
                    <p className="font-bold text-lg">{crypto.symbol}</p>
                    <p className="text-sm text-muted-foreground">{crypto.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${crypto.price.toLocaleString()}</p>
                    <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${
                      crypto.change > 0 
                        ? "text-success bg-success/20" 
                        : "text-destructive bg-destructive/20"
                    }`}>
                      {crypto.change > 0 ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      {crypto.change > 0 ? "+" : ""}{crypto.change}%
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Forex List */}
          <Card className="glass-card card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 premium-card rounded-lg">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-gradient">Major Currency Pairs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {forexPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl glass-card micro-bounce">
                  <div>
                    <p className="font-bold text-lg">{pair.pair}</p>
                    <p className="text-sm text-muted-foreground">Currency Exchange</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pair.price}</p>
                    <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${
                      pair.change > 0 
                        ? "text-success bg-success/20" 
                        : "text-destructive bg-destructive/20"
                    }`}>
                      {pair.change > 0 ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      {pair.change > 0 ? "+" : ""}{pair.change}%
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6 mt-8">
          <div className="space-y-6">
            <div className="glass-card p-1 rounded-2xl">
              <CryptoChart />
            </div>
            <div className="glass-card p-1 rounded-2xl">
              <ForexChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signals" className="mt-8">
          <div className="glass-card p-1 rounded-2xl">
            <TechnicalSignals />
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-8">
          <div className="glass-card p-1 rounded-2xl">
            <SmartCalculator />
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Footer */}
      <Card className="glass-card card-hover">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-3">
              <div className="p-3 premium-card rounded-xl mx-auto w-fit micro-bounce">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="font-bold text-base text-gradient">Real-Time Analytics</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Live market data with AI-powered insights
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-3 premium-card rounded-xl mx-auto w-fit micro-bounce">
                <Calculator className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="font-bold text-base text-gradient">Smart Tools</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced calculators & portfolio analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileDashboard;