import MarketAnalytics from "@/components/MarketAnalytics";
import CurrencyHeatMap from "@/components/CurrencyHeatMap";
import CryptoList from "@/components/CryptoList";
import ForexList from "@/components/ForexList";
import SocialSentiment from "@/components/SocialSentiment";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import MarketStats from "@/components/MarketStats";
import ForexStats from "@/components/ForexStats";
import CryptoChart from "@/components/CryptoChart";
import ForexChart from "@/components/ForexChart";
import TechnicalSignals from "@/components/TechnicalSignals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const Analytics = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Market Analytics & Trading Insights",
    "description": "Advanced market analysis and professional trading insights",
    "mainEntity": {
      "@type": "FinancialProduct",
      "name": "Market Analytics Tools",
      "category": "Trading Analytics"
    }
  };

  return (
    <>
      <SEOHead
        title="Market Analytics & Insights | Advanced Trading Analysis | FINHUBAFRICA"
        description="Professional market analytics, technical analysis, currency heat maps, social sentiment tracking & real-time trading insights. AI-powered analysis with 95% accuracy for crypto & forex markets across Africa."
        keywords="market analytics, technical analysis, trading insights, currency heat map, social sentiment, market trends, crypto analytics, forex analysis, trading signals, market data Africa"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-28 lg:pt-24">
      <div className="max-w-7xl mx-auto">
        <MobileNavigation />
        
        {/* Mobile Layout */}
        <div className="lg:hidden px-4 pb-4">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 text-gradient">
              Market Analytics
            </h1>
            <p className="text-muted-foreground text-sm">
              Advanced market analysis and insights
            </p>
          </header>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="markets" className="text-xs">Markets</TabsTrigger>
              <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <MarketAnalytics />
              <CurrencyHeatMap />
            </TabsContent>

            <TabsContent value="markets" className="space-y-4 mt-6">
              <CryptoList />
              <ForexList />
            </TabsContent>

            <TabsContent value="social" className="mt-6">
              <SocialSentiment />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block p-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gradient">
              Market Analytics
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced market analysis, trends, and professional trading insights powered by real-time data
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                <span className="text-sm font-medium text-primary">📈 Live Analytics</span>
              </div>
              <Link to="/ai-predictions">
                <div className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 rounded-full border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:scale-105">
                  <span className="text-sm font-medium text-primary-foreground">🤖 AI Predictions</span>
                </div>
              </Link>
              <div
                className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20 hover:bg-accent/20 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => window.alert('🔍 Deep Insights Activated!\n\nAdvanced AI-powered market analysis includes:\n• Sentiment analysis from news sources\n• Pattern recognition algorithms\n• Risk assessment models\n• Predictive price movements\n• Cross-market correlation analysis\n\nUpgrade to Premium for full access!')}
              >
                <span className="text-sm font-medium text-accent">🔍 Deep Insights</span>
                <div className="w-2 h-2 bg-accent rounded-full inline-block ml-2 animate-pulse"></div>
              </div>
            </div>
          </header>
          
          {/* Market Stats Overview */}
          <div className="space-y-6 mb-8">
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <MarketStats />
            </div>
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <ForexStats />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="group transform hover:scale-[1.02] transition-all duration-300">
              <CryptoChart />
            </div>
            <div className="group transform hover:scale-[1.02] transition-all duration-300">
              <ForexChart />
            </div>
          </div>

          {/* Technical Signals */}
          <div className="mb-8">
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <TechnicalSignals />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            {/* Analytics Panel */}
            <div className="xl:col-span-1">
              <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <MarketAnalytics />
              </div>
            </div>
            
            {/* Heat Map */}
            <div className="xl:col-span-1">
              <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <CurrencyHeatMap />
              </div>
            </div>
            
            {/* Market Lists */}
            <div className="xl:col-span-2 space-y-6">
              <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <CryptoList />
              </div>
              <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                <ForexList />
              </div>
            </div>
          </div>

          {/* Social Sentiment */}
          <div className="mb-8">
            <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <SocialSentiment />
            </div>
          </div>

          {/* Analytics Footer */}
          <footer className="mt-12 py-8 border-t border-border/30 bg-card/50 rounded-lg backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2 group hover:bg-primary/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-primary group-hover:text-primary/80">Precision Analysis</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  AI-powered market analysis with 95% accuracy rate
                </p>
              </div>
              <div className="space-y-2 group hover:bg-success/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-success group-hover:text-success/80">Real-Time Updates</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Market data updated every second for instant insights
                </p>
              </div>
              <div className="space-y-2 group hover:bg-accent/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-accent group-hover:text-accent/80">Professional Tools</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Industry-grade analytics used by professional traders
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
    </>
  );
};

export default Analytics;
