import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import NewsletterSection from "@/components/NewsletterSection";
import AffiliateSection from "@/components/AffiliateSection";
import CryptoToolsSection from "@/components/CryptoToolsSection";
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