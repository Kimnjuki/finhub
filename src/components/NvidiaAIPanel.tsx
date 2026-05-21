import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNvidiaAI } from '@/hooks/useNvidiaAI';
import { useCryptoPrice, type CryptoAsset } from '@/hooks/useCryptoPrice';
import { useCurrencyRates } from '@/hooks/useCurrencyRates';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Activity,
  Shield,
  Target,
  Loader2,
} from 'lucide-react';

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const colors: Record<string, string> = {
    bullish: 'bg-green-500/20 text-green-500 border-green-500/30',
    bearish: 'bg-red-500/20 text-red-500 border-red-500/30',
    neutral: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    mixed: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    strengthen: 'bg-green-500/20 text-green-500 border-green-500/30',
    weaken: 'bg-red-500/20 text-red-500 border-red-500/30',
    stable: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  };
  return (
    <Badge className={`${colors[sentiment.toLowerCase()] || 'bg-muted/20'} text-xs`} variant="outline">
      {sentiment}
    </Badge>
  );
};

const RiskBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    low: 'bg-green-500/20 text-green-500 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-500 border-red-500/30',
  };
  return (
    <Badge className={`${colors[level.toLowerCase()] || 'bg-muted/20'} text-xs`} variant="outline">
      {level}
    </Badge>
  );
};

const CryptoAnalysisCard = ({ 
  asset, 
  analysis, 
  loading 
}: { 
  asset: CryptoAsset; 
  analysis: any; 
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Card className="glass-card border-primary/20">
        <CardContent className="p-4 flex items-center justify-center h-32">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Analyzing {asset.name}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const priceChange = asset.price_change_percentage_24h || 0;
  const isPositive = analysis.technical_outlook === 'bullish';

  return (
    <Card className={`glass-card border-primary/20 hover:border-primary/40 transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div>
              <div className="font-semibold text-sm">{asset.symbol.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">{asset.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">${asset.current_price.toLocaleString()}</div>
            <div className={`text-xs ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Predicted Price</span>
            <span className="text-sm font-semibold">${analysis.predicted_price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${analysis.confidence_level}%` }}
                />
              </div>
              <span className="text-xs font-medium">{analysis.confidence_level}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <RiskBadge level={analysis.risk_level} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Outlook</span>
            <SentimentBadge sentiment={analysis.technical_outlook} />
          </div>
          {analysis.price_range && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Price Range</span>
              <span className="text-xs">
                ${analysis.price_range.low.toLocaleString()} - ${analysis.price_range.high.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {analysis.contributing_factors && analysis.contributing_factors.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Key Factors:</div>
            <ul className="space-y-0.5">
              {analysis.contributing_factors.map((factor: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.support_levels && analysis.support_levels.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
              <div className="text-xs text-green-500 font-medium">Support</div>
              <div className="text-xs">{analysis.support_levels.map((s: number) => `$${s.toLocaleString()}`).join(', ')}</div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
              <div className="text-xs text-red-500 font-medium">Resistance</div>
              <div className="text-xs">{analysis.resistance_levels.map((r: number) => `$${r.toLocaleString()}`).join(', ')}</div>
            </div>
          </div>
        )}

        {analysis.recommended_action && (
          <div className="bg-primary/5 border border-primary/20 rounded p-2">
            <div className="text-xs font-medium text-primary mb-0.5">Recommendation</div>
            <div className="text-xs text-muted-foreground">{analysis.recommended_action}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CurrencyAnalysisCard = ({
  pair,
  analysis,
  loading,
}: {
  pair: string;
  analysis: any;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Card className="glass-card border-primary/20">
        <CardContent className="p-3 flex items-center justify-center h-20">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Analyzing {pair}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const isStrengthen = analysis.forecast === 'strengthen';

  return (
    <div className="glass-card border-primary/20 rounded-lg p-3 hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium">{pair}</span>
        </div>
        <SentimentBadge sentiment={analysis.forecast} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Predicted Rate:</span>
          <span className="ml-1 font-medium">{analysis.predicted_rate?.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Confidence:</span>
          <span className="ml-1 font-medium">{analysis.confidence}%</span>
        </div>
      </div>
      {analysis.analysis && (
        <div className="mt-1.5 text-xs text-muted-foreground">{analysis.analysis}</div>
      )}
    </div>
  );
};

const MarketSentimentCard = ({ sentiment, loading }: { sentiment: any; loading: boolean }) => {
  if (loading) {
    return (
      <Card className="glass-card border-primary/20">
        <CardContent className="p-4 flex items-center justify-center h-24">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Analyzing market sentiment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentiment) return null;

  const fgColor = sentiment.fear_greed_index > 60 ? 'text-green-500' : sentiment.fear_greed_index > 40 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Market Sentiment</span>
          </div>
          <SentimentBadge sentiment={sentiment.overall_sentiment} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Fear & Greed Index</span>
            <span className={`text-sm font-bold ${fgColor}`}>{sentiment.fear_greed_index}/100</span>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Crypto Market</div>
            <p className="text-xs">{sentiment.crypto_sentiment}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Forex Market</div>
            <p className="text-xs">{sentiment.forex_sentiment}</p>
          </div>

          {sentiment.news_impact && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">News Impact</div>
              <p className="text-xs">{sentiment.news_impact}</p>
            </div>
          )}

          {sentiment.key_levels_to_watch && sentiment.key_levels_to_watch.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Key Levels to Watch</div>
              <ul className="space-y-0.5">
                {sentiment.key_levels_to_watch.map((level: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <Target className="h-3 w-3 text-primary mt-0.5" />
                    {level}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sentiment.summary && (
            <>
              <Separator className="bg-border/50" />
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Summary</div>
                <p className="text-xs">{sentiment.summary}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const NvidiaAIPanel = () => {
  const { cryptoData } = useCryptoPrice();
  const { rates: currencyRates } = useCurrencyRates();
  const {
    cryptoAnalysis,
    currencyAnalysis,
    marketSentiment,
    analyzeCrypto,
    analyzeTopCryptos,
    analyzeAfricanCurrencyPairs,
    refreshMarketSentiment,
    isLoading,
    isCryptoDataReady,
    isCurrencyDataReady,
  } = useNvidiaAI();

  const [selectedCrypto, setSelectedCrypto] = useState<string>('');

  const handleAnalyzeAll = useCallback(async () => {
    await analyzeTopCryptos(3);
    await analyzeAfricanCurrencyPairs();
    await refreshMarketSentiment();
  }, [analyzeTopCryptos, analyzeAfricanCurrencyPairs, refreshMarketSentiment]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">NVIDIA AI Market Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Real-time AI-powered analysis using live market data
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyzeAll}
          disabled={!isCryptoDataReady || !isCurrencyDataReady}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Analyze All
        </Button>
      </div>

      {/* Market Sentiment */}
      <MarketSentimentCard 
        sentiment={marketSentiment} 
        loading={isLoading('market-sentiment')} 
      />

      {/* Crypto Analysis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Crypto AI Predictions</h4>
          </div>
          {cryptoData && cryptoData.length > 0 && (
            <select
              className="text-xs bg-background border border-border rounded px-2 py-1"
              value={selectedCrypto}
              onChange={(e) => {
                setSelectedCrypto(e.target.value);
                const crypto = cryptoData.find(c => c.id === e.target.value);
                if (crypto) analyzeCrypto(crypto);
              }}
            >
              <option value="">Analyze specific...</option>
              {cryptoData.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cryptoData?.slice(0, 3).map((crypto) => {
            const key = `crypto-${crypto.id}`;
            return (
              <CryptoAnalysisCard
                key={key}
                asset={crypto}
                analysis={cryptoAnalysis[key]}
                loading={isLoading(key)}
              />
            );
          })}
        </div>
      </div>

      {/* Currency Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Currency Pair Forecasts</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            ['USD', 'KES'],
            ['USD', 'NGN'],
            ['USD', 'ZAR'],
            ['USD', 'GHS'],
            ['USD', 'EUR'],
            ['USD', 'GBP'],
          ].map(([base, target]) => {
            const key = `forex-${base}-${target}`;
            return (
              <CurrencyAnalysisCard
                key={key}
                pair={`${base}/${target}`}
                analysis={currencyAnalysis[key]}
                loading={isLoading(key)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NvidiaAIPanel;