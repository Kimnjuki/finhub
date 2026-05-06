import LiveNewsFeed from "@/components/LiveNewsFeed";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";

const News = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "Latest Financial News from African and Global Markets",
    "description": "Real-time financial news covering forex, cryptocurrency, commodities, and market trends across Africa",
    "publisher": {
      "@type": "Organization",
      "name": "FINHUBAFRICA",
      "logo": {
        "@type": "ImageObject",
        "url": "https://finhubafrica.com/og-image.svg"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Latest Financial News & Market Updates Africa | Forex & Crypto News | FINHUBAFRICA"
        description="Breaking financial news for African traders. Real-time market updates on forex, cryptocurrency, commodities & economic developments. Bloomberg Africa coverage, Central Bank decisions, Bitcoin ETF news & market sentiment analysis."
        keywords="financial news Africa, market news today, forex news live, cryptocurrency news, Bitcoin news, African markets news, economic news Africa, trading news, Bloomberg Africa, Central Bank news, market updates, forex analysis, crypto market news"
        structuredData={{
          ...structuredData,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://finhubafrica.com/news"
          },
          "keywords": "financial news, market updates, forex news, cryptocurrency news, African markets"
        }}
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-28 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <MobileNavigation />
          
          <div className="p-4 md:p-8">
          
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4 font-vogun text-gradient-green">
              Global Financial News & Market Analysis
            </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-vogun leading-relaxed">
            Stay ahead with comprehensive financial news coverage featuring real-time market updates, breaking economic events, and specialized African market analysis from Bloomberg, Reuters, and regional financial publications
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20 hover:bg-accent/20 transition-all duration-300 cursor-pointer">
              <span className="text-sm font-medium text-accent">📰 Breaking News</span>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
              <span className="text-sm font-medium text-primary">⚡ Live Updates</span>
            </div>
          </div>
          
          {/* Ad Space - News Header */}
          <div className="mx-auto max-w-3xl mt-6 p-4 bg-muted/20 border border-border/40 rounded-lg">
            <span className="text-sm text-muted-foreground">Sponsored - Premium Financial News & Market Analysis</span>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="transform hover:scale-[1.01] transition-all duration-300">
              <LiveNewsFeed />
            </div>
          </div>
          
          {/* News sidebar */}
          <div className="space-y-6">
            {/* Bloomberg Africa Breaking News */}
            <div className="glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
              <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                🌍 Bloomberg Africa Today
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-accent pl-4 hover:bg-accent/5 py-2 transition-all duration-300 cursor-pointer group/item">
                  <h4 className="font-medium text-sm group-hover/item:text-accent mb-1">
                    Nigerian Central Bank Raises Rates to Combat Inflation
                  </h4>
                  <p className="text-xs text-muted-foreground group-hover/item:text-foreground/70">
                    CBN increases benchmark rate by 200 basis points as inflation hits 24.3%
                  </p>
                  <span className="text-xs text-accent">2 hours ago</span>
                </div>
                <div className="border-l-4 border-primary pl-4 hover:bg-primary/5 py-2 transition-all duration-300 cursor-pointer group/item">
                  <h4 className="font-medium text-sm group-hover/item:text-primary mb-1">
                    South African Mining Sector Shows Strong Q4 Performance
                  </h4>
                  <p className="text-xs text-muted-foreground group-hover/item:text-foreground/70">
                    Gold and platinum exports drive 12% increase in mining revenue
                  </p>
                  <span className="text-xs text-primary">4 hours ago</span>
                </div>
                <div className="border-l-4 border-success pl-4 hover:bg-success/5 py-2 transition-all duration-300 cursor-pointer group/item">
                  <h4 className="font-medium text-sm group-hover/item:text-success mb-1">
                    Kenya's Tech Hub Attracts $2.5B in Fintech Investment
                  </h4>
                  <p className="text-xs text-muted-foreground group-hover/item:text-foreground/70">
                    Mobile payment solutions and digital banking drive funding surge
                  </p>
                  <span className="text-xs text-success">6 hours ago</span>
                </div>
                <div className="border-l-4 border-warning pl-4 hover:bg-warning/5 py-2 transition-all duration-300 cursor-pointer group/item">
                  <h4 className="font-medium text-sm group-hover/item:text-warning mb-1">
                    Egyptian Pound Stabilizes Following IMF Agreement
                  </h4>
                  <p className="text-xs text-muted-foreground group-hover/item:text-foreground/70">
                    Currency gains strength after $3B IMF loan facility approval
                  </p>
                  <span className="text-xs text-warning">8 hours ago</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
              <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">📊 Market Sentiment</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-success/5 transition-all duration-300 cursor-pointer group/item">
                  <span className="text-sm group-hover/item:font-medium">💰 Crypto Markets</span>
                  <span className="text-success font-medium group-hover/item:scale-110 transition-transform duration-300">Bullish</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-warning/5 transition-all duration-300 cursor-pointer group/item">
                  <span className="text-sm group-hover/item:font-medium">🏦 Forex Markets</span>
                  <span className="text-warning font-medium group-hover/item:scale-110 transition-transform duration-300">Neutral</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-all duration-300 cursor-pointer group/item">
                  <span className="text-sm group-hover/item:font-medium">⚖️ Overall Risk</span>
                  <span className="text-primary font-medium group-hover/item:scale-110 transition-transform duration-300">Moderate</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
              <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">⚡ Quick Updates</h3>
              <div className="space-y-3 text-sm">
                <div className="border-l-2 border-primary pl-3 hover:bg-primary/5 p-2 rounded-r-lg transition-all duration-300 cursor-pointer group/update">
                  <p className="font-medium group-hover/update:text-primary">📈 Federal Reserve Meeting</p>
                  <p className="text-muted-foreground group-hover/update:text-foreground/70">Next meeting in 5 days</p>
                </div>
                <div className="border-l-2 border-accent pl-3 hover:bg-accent/5 p-2 rounded-r-lg transition-all duration-300 cursor-pointer group/update">
                  <p className="font-medium group-hover/update:text-accent">🏛️ ECB Rate Decision</p>
                  <p className="text-muted-foreground group-hover/update:text-foreground/70">Next week Thursday</p>
                </div>
                <div className="border-l-2 border-success pl-3 hover:bg-success/5 p-2 rounded-r-lg transition-all duration-300 cursor-pointer group/update">
                  <p className="font-medium group-hover/update:text-success">₿ Bitcoin ETF Update</p>
                  <p className="text-muted-foreground group-hover/update:text-foreground/70">2 hours ago</p>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="glass-card p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
              <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">📈 Live Market Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-primary/5 transition-all duration-300">
                  <span className="text-sm">📰 News Updates</span>
                  <span className="text-primary font-mono animate-pulse">247/day</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-success/5 transition-all duration-300">
                  <span className="text-sm">👥 Active Traders</span>
                  <span className="text-success font-mono animate-pulse">12.4K</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/5 transition-all duration-300">
                  <span className="text-sm">🔥 Trending Topics</span>
                  <span className="text-accent font-mono animate-pulse">8</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        </div>
      </main>
    </>
  );
};

export default News;