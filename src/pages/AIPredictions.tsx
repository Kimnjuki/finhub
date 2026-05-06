import { useMarketData } from "@/contexts/MarketDataContext";
import AIPredictionPanel from "@/components/ai/AIPredictionPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";

const AIPredictions = () => {
  const { cryptoData, isLoading } = useMarketData();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FINHUBAFRICA AI Price Predictions",
    "applicationCategory": "FinanceApplication",
    "description": "AI-powered cryptocurrency price predictions using advanced machine learning"
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-28 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-96 mb-8" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </main>
    );
  }

  const crypto = cryptoData?.find(c => c.symbol === selectedCrypto) || cryptoData?.[0];

  return (
    <>
      <SEOHead
        title="AI Price Predictions | Cryptocurrency Forecasting | FINHUBAFRICA"
        description="Advanced AI-powered cryptocurrency price predictions with confidence levels, technical analysis, and contributing factors. Get 24h, 7d, and 30d forecasts for Bitcoin, Ethereum, and major cryptocurrencies."
        keywords="AI price prediction, cryptocurrency forecast, Bitcoin prediction, Ethereum forecast, machine learning trading, crypto analysis, price forecast AI, technical analysis AI"
        structuredData={structuredData}
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-28 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">AI Price Predictions</h1>
                <p className="text-muted-foreground mt-1">
                  Advanced machine learning forecasts for cryptocurrency markets
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center mt-6">
              <div className="flex-1 min-w-[250px]">
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger className="w-full bg-card/50 border-primary/20">
                    <SelectValue placeholder="Select cryptocurrency">
                      {crypto && (
                        <div className="flex items-center gap-2">
                          <img src={crypto.image} alt={crypto.name} className="w-5 h-5 rounded-full" />
                          <span>{crypto.name} ({crypto.symbol.toUpperCase()})</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoData?.map((c) => (
                      <SelectItem key={c.symbol} value={c.symbol}>
                        <div className="flex items-center gap-2">
                          <img src={c.image} alt={c.name} className="w-5 h-5 rounded-full" />
                          <span>{c.name}</span>
                          <span className="text-muted-foreground text-xs">({c.symbol.toUpperCase()})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Powered by Google Gemini AI</span>
              </div>
            </div>
          </header>

          {crypto && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-primary">
                    ${crypto.current_price.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                  <p className={`text-2xl font-bold ${crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">
                    ${(crypto.market_cap / 1e9).toFixed(2)}B
                  </p>
                </div>
              </div>

              <AIPredictionPanel crypto={crypto} />
            </div>
          )}

          <div className="mt-12 p-6 bg-card/30 rounded-lg border border-border/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              How AI Predictions Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Technical Analysis</h3>
                <p>Our AI analyzes RSI, moving averages, volatility, and momentum indicators to identify trends and patterns.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Market Context</h3>
                <p>Price predictions consider current market conditions, trading volume, and recent price action.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Confidence Scoring</h3>
                <p>Each prediction includes a confidence level based on data quality and market volatility.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
                <p>Predictions include risk levels to help you make informed trading decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AIPredictions;
