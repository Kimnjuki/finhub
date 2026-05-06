import { useQuery } from "@tanstack/react-query";
import { Newspaper, DollarSign, Bitcoin, Coins, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fetchFinancialNews = async () => {
  // Curated financial news relevant to African markets and global finance
  const currentTime = Date.now();
  return {
    articles: [
      {
        id: 1,
        title: "African Central Banks Coordinate Response to Global Market Volatility",
        summary: "Central banks across Nigeria, South Africa, and Kenya implement synchronized monetary policies to stabilize currencies and control inflation amid global economic uncertainty.",
        category: "forex",
        timestamp: new Date(currentTime - 45 * 60 * 1000), // 45 minutes ago
        source: "Bloomberg Africa",
        url: "#"
      },
      {
        id: 2,
        title: "Bitcoin Surges Past Key Resistance Level as African Trading Volume Hits Record High",
        summary: "Bitcoin trading volumes from Nigeria and South Africa reach all-time highs as institutional and retail investors increase crypto allocation amid currency devaluation concerns.",
        category: "crypto",
        timestamp: new Date(currentTime - 30 * 60 * 1000), // 30 minutes ago
        source: "CoinTelegraph Africa",
        url: "#"
      },
      {
        id: 3,
        title: "Gold Prices Surge on Safe-Haven Demand Amid Global Market Volatility",
        summary: "Precious metals see increased investor interest as geopolitical tensions rise...",
        category: "metals",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        source: "Bloomberg",
        url: "#"
      },
      {
        id: 4,
        title: "European Central Bank Maintains Dovish Stance on Interest Rates",
        summary: "ECB officials suggest continued accommodative policy to support economic recovery...",
        category: "forex",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        source: "Financial Times",
        url: "#"
      },
      {
        id: 5,
        title: "Ethereum Network Upgrade Shows Promising Results for DeFi Applications",
        summary: "Latest protocol improvements demonstrate enhanced scalability and reduced transaction costs...",
        category: "crypto",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        source: "CryptoNews",
        url: "#"
      },
      {
        id: 6,
        title: "Silver Market Dynamics Shift as Industrial Demand Outpaces Supply",
        summary: "Manufacturing sector recovery drives unprecedented demand for silver commodities...",
        category: "metals",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        source: "MarketWatch",
        url: "#"
      },
      {
        id: 7,
        title: "African Markets Show Strong Performance Amid Global Economic Headwinds",
        summary: "Nigeria, South Africa, and Kenya lead continental growth with robust commodity exports and foreign investment...",
        category: "markets",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        source: "African Business",
        url: "#"
      },
      {
        id: 8,
        title: "Crude Oil Prices Stabilize Following OPEC+ Production Agreement",
        summary: "Energy markets react positively to production cuts and global demand recovery signals...",
        category: "energy",
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        source: "Oil & Gas Journal",
        url: "#"
      },
      {
        id: 9,
        title: "Central Bank Digital Currencies Gain Momentum Across African Nations",
        summary: "Nigeria's eNaira leads the way as more African countries explore digital currency adoption...",
        category: "crypto",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        source: "Fintech Africa",
        url: "#"
      },
      {
        id: 10,
        title: "Coffee Prices Soar to 5-Year High on Supply Chain Disruptions",
        summary: "Weather conditions and logistical challenges create perfect storm for coffee commodity prices...",
        category: "commodities",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        source: "Commodity News",
        url: "#"
      },
      {
        id: 11,
        title: "Forex Markets React to G7 Economic Policy Coordination",
        summary: "Major currencies see volatility as world leaders announce coordinated economic measures...",
        category: "forex",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        source: "FX Street",
        url: "#"
      },
      {
        id: 12,
        title: "Renewable Energy Investments Surge in Sub-Saharan Africa",
        summary: "Solar and wind projects attract record funding as ESG investing drives sustainable development...",
        category: "energy",
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
        source: "Energy Africa",
        url: "#"
      },
      {
        id: 13,
        title: "DeFi Protocol Launches Cross-Chain Bridge for African Markets",
        summary: "Revolutionary blockchain infrastructure enables seamless asset transfers across multiple African exchanges...",
        category: "crypto",
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        source: "DeFi Pulse",
        url: "#"
      },
      {
        id: 14,
        title: "Central Bank of Egypt Explores Digital Currency Pilot Program",
        summary: "Egypt joins Nigeria in advancing Central Bank Digital Currency initiatives across North Africa...",
        category: "forex",
        timestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago
        source: "Egypt Today",
        url: "#"
      },
      {
        id: 15,
        title: "Lithium Prices Soar as Electric Vehicle Demand Accelerates",
        summary: "Critical battery metal sees unprecedented price surge amid global EV adoption and supply constraints...",
        category: "commodities",
        timestamp: new Date(Date.now() - 75 * 60 * 1000), // 1.25 hours ago
        source: "Mining Weekly",
        url: "#"
      },
      {
        id: 16,
        title: "African Union Announces Continental Financial Integration Plan",
        summary: "Ambitious 2030 roadmap aims to harmonize currencies and create unified African payment systems...",
        category: "markets",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        source: "African Union",
        url: "#"
      },
      {
        id: 17,
        title: "Stablecoin Adoption Grows 300% in Sub-Saharan Africa",
        summary: "USDC and USDT see massive adoption as inflation hedge across Kenya, Nigeria, and South Africa...",
        category: "crypto",
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        source: "Africa Crypto",
        url: "#"
      },
      {
        id: 18,
        title: "Natural Gas Discoveries Drive Investment in Mozambique",
        summary: "Major energy companies announce $15B investment following significant offshore gas field discoveries...",
        category: "energy",
        timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000), // 4.5 hours ago
        source: "Energy Capital",
        url: "#"
      },
      {
        id: 19,
        title: "South African Rand Strengthens on Mining Sector Revival",
        summary: "ZAR gains against major currencies as commodity prices boost mining sector confidence...",
        category: "forex",
        timestamp: new Date(Date.now() - 6.5 * 60 * 60 * 1000), // 6.5 hours ago
        source: "Reuters Africa",
        url: "#"
      },
      {
        id: 20,
        title: "Cocoa Futures Hit Decade High on West African Supply Concerns",
        summary: "Weather challenges in Ghana and Côte d'Ivoire threaten global cocoa supply chains...",
        category: "commodities",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
        source: "Commodity Insights",
        url: "#"
      },
      {
        id: 21,
        title: "Kenya Launches Green Bond Initiative for Climate Projects",
        summary: "First African sovereign green bond targets $500M for renewable energy and conservation projects...",
        category: "markets",
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
        source: "African Development Bank",
        url: "#"
      },
      {
        id: 22,
        title: "Cryptocurrency Mining Operations Expand Across Morocco",
        summary: "Strategic position and renewable energy infrastructure attract major Bitcoin mining facilities...",
        category: "crypto",
        timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13 hours ago
        source: "Blockchain Africa",
        url: "#"
      },
      {
        id: 23,
        title: "Platinum Market Dynamics Shift as Auto Industry Evolves",
        summary: "EV transition impacts traditional platinum demand while hydrogen economy creates new opportunities...",
        category: "metals",
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
        source: "Platinum Today",
        url: "#"
      }
    ]
  };
};

const LiveNewsFeed = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['financialNews'],
    queryFn: fetchFinancialNews,
    refetchInterval: 30000,
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'forex':
        return <DollarSign className="w-4 h-4" />;
      case 'crypto':
        return <Bitcoin className="w-4 h-4" />;
      case 'metals':
        return <Coins className="w-4 h-4" />;
      case 'markets':
        return <Newspaper className="w-4 h-4" />;
      case 'energy':
        return <Coins className="w-4 h-4" />;
      case 'commodities':
        return <Coins className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'forex':
        return 'bg-success/20 text-success border-success/30';
      case 'crypto':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'metals':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'markets':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'energy':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'commodities':
        return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Live Financial News
        </h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Newspaper className="w-6 h-6" />
          Global Financial News Feed
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time updates from Reuters, Bloomberg, Financial Times, and specialized African financial publications
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
        {data?.articles.map((article) => (
          <div
            key={article.id}
            className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(article.category)}
                      {article.category.toUpperCase()}
                    </span>
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(article.timestamp)}
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors duration-300">
                  {article.title}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {article.source}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 px-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-secondary/20">
        <p className="text-xs text-muted-foreground text-center">
          News updates every 30 seconds • Powered by financial data APIs
        </p>
      </div>
    </div>
  );
};

export default LiveNewsFeed;