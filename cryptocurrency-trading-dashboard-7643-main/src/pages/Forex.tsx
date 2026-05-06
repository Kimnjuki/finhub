import ForexStats from "@/components/ForexStats";
import ForexChart from "@/components/ForexChart";
import ForexPortfolio from "@/components/ForexPortfolio";
import ForexList from "@/components/ForexList";
import CurrencyHeatMap from "@/components/CurrencyHeatMap";
import SmartCalculator from "@/components/SmartCalculator";
import LiveNewsFeed from "@/components/LiveNewsFeed";
import MarketAnalytics from "@/components/MarketAnalytics";
import Navigation from "@/components/Navigation";

const Forex = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forex Exchange Platform
          </h1>
          <p className="text-muted-foreground">
            Real-time foreign exchange rates, analytics, and professional trading tools
          </p>
        </header>
        
        {/* Top Stats */}
        <ForexStats />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          {/* Left Column - Charts and Calculator */}
          <div className="xl:col-span-2 space-y-6">
            <ForexChart />
            <SmartCalculator />
          </div>
          
          {/* Middle Column - Portfolio and Heat Map */}
          <div className="xl:col-span-1 space-y-6">
            <ForexPortfolio />
            <CurrencyHeatMap />
          </div>
          
          {/* Right Column - Analytics and News */}
          <div className="xl:col-span-1 space-y-6">
            <MarketAnalytics />
            <LiveNewsFeed />
          </div>
        </div>
        
        {/* Bottom Section - Currency List */}
        <ForexList />
        
        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-secondary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Real-Time Data</h4>
              <p className="text-xs text-muted-foreground">
                Live forex rates updating every 30 seconds from multiple liquidity providers
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Advanced Analytics</h4>
              <p className="text-xs text-muted-foreground">
                Professional-grade market analysis with volatility monitoring and trend detection
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Global Coverage</h4>
              <p className="text-xs text-muted-foreground">
                50+ currencies including major, minor, exotic pairs and African currencies
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Forex;