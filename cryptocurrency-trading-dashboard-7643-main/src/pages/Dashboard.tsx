import MobileNavigation from "@/components/MobileNavigation";
import MobileDashboard from "@/components/MobileDashboard";
import PortfolioCard from "@/components/PortfolioCard";
import ForexPortfolio from "@/components/ForexPortfolio";
import SmartCalculator from "@/components/SmartCalculator";
import SEOHead from "@/components/SEOHead";
import { MarketDataProvider } from "@/contexts/MarketDataContext";
import LivePriceGrid from "@/components/market/LivePriceGrid";

const Dashboard = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FINHUBAFRICA Trading Dashboard",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <MarketDataProvider>
      <SEOHead
        title="Professional Trading Dashboard | Real-time Crypto & Forex Charts | FINHUBAFRICA"
        description="Unified trading dashboard with live cryptocurrency & forex data. Advanced TradingView charts, technical indicators, portfolio tracking, market analytics & trading signals. Monitor Bitcoin, Ethereum, USD/ZAR, EUR/USD & 100+ assets in real-time."
        keywords="trading dashboard, crypto charts, forex charts, real-time market data, portfolio tracker, technical analysis, trading signals, market analytics, TradingView charts, cryptocurrency trading, forex trading platform, live prices"
        structuredData={{
          ...structuredData,
          "featureList": [
            "Real-time cryptocurrency prices",
            "Live forex rates",
            "Advanced charting tools",
            "Portfolio tracking",
            "Technical analysis",
            "Trading signals",
            "Risk calculator",
            "Market sentiment analysis"
          ]
        }}
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-28 lg:pt-24">
      <div className="max-w-7xl mx-auto">
        <MobileNavigation />
        
        {/* Mobile-First Layout */}
        <div className="lg:hidden px-4 pb-4">
          <MobileDashboard />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block p-8">
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4 text-gradient">
              Trading Platform
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unified crypto and forex trading dashboard with real-time market data and advanced analytics
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-sm font-medium text-primary">⚡ Live Data</span>
              </div>
              <div className="px-4 py-2 bg-success/10 rounded-full border border-success/20">
                <span className="text-sm font-medium text-success">🔒 Secure</span>
              </div>
              <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <span className="text-sm font-medium text-accent">📊 Advanced</span>
              </div>
            </div>
          </header>
          
          {/* Live Market Data Grid */}
          <div className="mb-8">
            <LivePriceGrid />
          </div>

          {/* Smart Calculator */}
          <div className="mb-8">
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <SmartCalculator />
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="group transform hover:scale-[1.02] transition-all duration-300">
              <PortfolioCard />
            </div>
            <div className="group transform hover:scale-[1.02] transition-all duration-300">
              <ForexPortfolio />
            </div>
          </div>
          
          {/* Quick Stats Footer with Tools Links */}
          <footer className="mt-12 py-8 border-t border-border/30 bg-card/50 rounded-lg backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <a href="/tools#risk" className="space-y-2 group hover:bg-primary/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-primary group-hover:text-primary/80">Risk Calculator</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Calculate position sizes and manage your trading risk
                </p>
              </a>
              <a href="/tools#portfolio" className="space-y-2 group hover:bg-success/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">💼</div>
                <h4 className="font-semibold text-success group-hover:text-success/80">Portfolio Tracker</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Track and analyze your investment portfolio performance
                </p>
              </a>
              <a href="/tools#simulator" className="space-y-2 group hover:bg-accent/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-accent group-hover:text-accent/80">Trading Simulator</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Practice trading risk-free with virtual money
                </p>
              </a>
              <a href="/analytics" className="space-y-2 group hover:bg-warning/5 p-4 rounded-lg transition-all duration-300 cursor-pointer">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-warning group-hover:text-warning/80">Market Analytics</h4>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                  Advanced market analysis and trading insights
                </p>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </main>
    </MarketDataProvider>
  );
};

export default Dashboard;