import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Brain, RefreshCw } from 'lucide-react';
import { useAIPrediction } from '@/hooks/useAIPrediction';
import type { CryptoAsset } from '@/hooks/useCryptoPrice';
import PredictionChart from './PredictionChart';
import ConfidenceIndicator from './ConfidenceIndicator';
import FactorsCard from './FactorsCard';

interface AIPredictionPanelProps {
  crypto: CryptoAsset;
}

const AIPredictionPanel = ({ crypto }: AIPredictionPanelProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const { generatePrediction, getPrediction, isLoading } = useAIPrediction();

  const prediction = getPrediction(crypto.symbol, selectedTimeframe);
  const loading = isLoading(crypto.symbol, selectedTimeframe);

  const handleGeneratePrediction = async () => {
    await generatePrediction(crypto, selectedTimeframe);
  };

  const getPriceChange = () => {
    if (!prediction) return 0;
    return ((prediction.predicted_price - crypto.current_price) / crypto.current_price) * 100;
  };

  const priceChange = getPriceChange();
  const isPositive = priceChange >= 0;

  return (
    <Card className="glass-card border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Price Prediction
          </CardTitle>
          <Badge variant="outline" className="border-primary/40">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Tabs value={selectedTimeframe} onValueChange={(v) => setSelectedTimeframe(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="24h">24 Hours</TabsTrigger>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {!prediction && !loading && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Generate AI-powered prediction for {crypto.name}
            </p>
            <Button onClick={handleGeneratePrediction} disabled={loading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Prediction
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">Analyzing market data...</p>
          </div>
        )}

        {prediction && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Predicted Price</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-primary">
                    ${prediction.predicted_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(priceChange).toFixed(2)}%
                  </Badge>
                </div>
              </div>

              <ConfidenceIndicator confidence={prediction.confidence_level} />
            </div>

            <PredictionChart 
              currentPrice={crypto.current_price}
              predictedPrice={prediction.predicted_price}
              priceRange={prediction.price_range}
              timeframe={selectedTimeframe}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Price Range</p>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Low</p>
                    <p className="font-semibold">${prediction.price_range.low.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">High</p>
                    <p className="font-semibold">${prediction.price_range.high.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      prediction.risk_level === 'high' ? 'text-destructive' :
                      prediction.risk_level === 'medium' ? 'text-warning' :
                      'text-success'
                    }`} />
                    <span className="font-semibold capitalize">{prediction.risk_level}</span>
                  </div>
                </div>
              </div>
            </div>

            <FactorsCard factors={prediction.contributing_factors} />

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">{prediction.analysis_summary}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Generated: {new Date(prediction.timestamp).toLocaleString()}
              </p>
              <Button variant="outline" size="sm" onClick={handleGeneratePrediction}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPredictionPanel;
