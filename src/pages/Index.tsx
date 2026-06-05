import { Link } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import NewsletterSection from "@/components/NewsletterSection";
import AffiliateSection from "@/components/AffiliateSection";
import CryptoToolsSection from "@/components/CryptoToolsSection";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <SEOHead
        title="FINHUBAFRICA | Smarter Crypto & Financial Decisions - #1 African Trading Platform"
        description="Track crypto markets, analyze your portfolio, and access the best financial tools in one place. Join 12,400+ African traders on Africa's leading crypto & forex platform with real-time data, advanced tools, and weekly insights."
        keywords="crypto trading Africa, forex trading Africa, Bitcoin price, Ethereum trading, cryptocurrency exchange, crypto dashboard, portfolio tracker, profit loss calculator, live crypto prices, CoinGecko, African markets, trading platform Africa, crypto tools, financial insights, market analytics"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "FINHUBAFRICA Trading Platform",
          "description": "Professional crypto and forex trading platform for African markets with real-time data and advanced tools",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          }
        }}
      />
      <main className="min-h-screen bg-background pt-20 lg:pt-24">
        <MobileNavigation />
        
        <HeroSection
          headline="Smarter Crypto & Financial Decisions"
          subtext="Track crypto markets, analyze your portfolio, and access the best financial tools in one place."
          primaryCTA={{ label: "Explore Dashboard", link: "/dashboard" }}
          secondaryCTA={{ label: "Join Weekly Insights", link: "#newsletter" }}
        />

        <FeatureCards
          columns={3}
          cards={[
            {
              title: "📈 Real-Time Prices",
              text: "Track crypto prices across major exchanges with live updates powered by CoinGecko API."
            },
            {
              title: "💰 Portfolio Tracker",
              text: "Easily calculate your profit/loss and monitor performance in one dashboard."
            },
            {
              title: "🧠 Financial Tools",
              text: "Use calculators and charts to make smarter investment decisions."
            }
          ]}
        />

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Africa-First Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Built for African traders. No other platform offers this combination of local payment methods, social trading, and financial tools.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/mobile-money" className="block">
                <Card className="glass-card border-primary/20 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">💳 Mobile Money</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Buy/sell crypto via M-Pesa, Airtel Money, MTN MoMo. Instant KES/NGN/ZAR on/off ramp with zero fees.</p>
                    <span className="text-sm text-green-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/social-trading" className="block">
                <Card className="glass-card border-primary/20 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">👥 Social Trading</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Follow and copy Africa's top traders. Real-time trade feed, leaderboards, and automated copy trading.</p>
                    <span className="text-sm text-purple-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/p2p" className="block">
                <Card className="glass-card border-primary/20 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">🤝 P2P Marketplace</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Trade crypto directly with 50+ local payment methods across 54 African countries. Escrow-protected.</p>
                    <span className="text-sm text-blue-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/vault" className="block">
                <Card className="glass-card border-primary/20 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">🔒 Vault</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Secure storage with time-delayed withdrawals, multi-approval, and whitelisted addresses.</p>
                    <span className="text-sm text-amber-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/learn" className="block">
                <Card className="glass-card border-primary/20 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">🎓 Learn and Earn</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Educational content with crypto rewards. Complete quizzes and earn crypto after each lesson.</p>
                    <span className="text-sm text-cyan-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/recurring" className="block">
                <Card className="glass-card border-primary/20 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">Recurring Buys</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">Automate your investments with daily, weekly, or monthly buys. Dollar-cost averaging at micro-level.</p>
                    <span className="text-sm text-pink-400 font-medium">Learn more →</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <CryptoToolsSection />

        <AffiliateSection
          heading="Trusted Crypto Platforms"
          description="Trade and store crypto securely using our trusted partners."
          items={[
            {
              name: "Binance",
              description: "Buy, sell, and trade over 350 cryptocurrencies.",
              link: "https://www.binance.com/en/register"
            },
            {
              name: "Coinbase",
              description: "Simple and secure crypto trading for beginners.",
              link: "https://coinbase.com/join"
            },
            {
              name: "Ledger Wallet",
              description: "Secure your assets with the best cold wallets.",
              link: "https://shop.ledger.com"
            }
          ]}
        />

        <NewsletterSection
          heading="Join our Weekly Crypto Insights"
          description="Subscribe to receive curated crypto news, tools, and trade tips every week."
        />

        <Footer />
      </main>
    </>
  );
};

export default Index;