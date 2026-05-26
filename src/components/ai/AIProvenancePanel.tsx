import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ChevronRight, Clock, Cpu, Database, FileText, GitBranch, Info, Layers, TrendingUp } from "lucide-react";

interface AiRunSource {
  sourceType: string;
  sourceId: string;
  instrumentId?: string;
  recordId: string;
  weight: number;
}

interface AiRun {
  id: string;
  runType: 'prediction' | 'signal_generation' | 'sentiment_analysis' | 'screener' | 'summarization';
  featureName: string;
  promptVersion: string;
  modelVersion: string;
  inputSummary: string;
  outputSummary: string;
  confidence: number;
  latencyMs: number;
  tokensUsed: number;
  status: 'completed' | 'failed' | 'running';
  createdAt: string;
  sources: AiRunSource[];
}

const mockAiRuns: AiRun[] = [
  {
    id: 'run-001',
    runType: 'prediction',
    featureName: 'BTC Price Prediction',
    promptVersion: 'v2.3',
    modelVersion: 'gpt-4-turbo',
    inputSummary: 'OHLCV data (30d), onchain metrics, funding rates, market sentiment',
    outputSummary: 'BTC predicted to reach $82,500 within 7 days with 73% confidence',
    confidence: 0.73,
    latencyMs: 2840,
    tokensUsed: 4521,
    status: 'completed',
    createdAt: '2026-05-26T12:30:00Z',
    sources: [
      { sourceType: 'ohlcv', sourceId: 'binance', instrumentId: 'BTCUSDT', recordId: 'ohlcv_1m_001', weight: 0.35 },
      { sourceType: 'onchain', sourceId: 'glassnode', instrumentId: 'BTC', recordId: 'onchain_001', weight: 0.25 },
      { sourceType: 'news', sourceId: 'cryptopanic', recordId: 'news_045', weight: 0.15 },
      { sourceType: 'funding', sourceId: 'binance', instrumentId: 'BTCUSDT', recordId: 'funding_001', weight: 0.15 },
      { sourceType: 'social', sourceId: 'lunar_crush', recordId: 'social_023', weight: 0.10 },
    ],
  },
  {
    id: 'run-002',
    runType: 'sentiment_analysis',
    featureName: 'Market Sentiment',
    promptVersion: 'v1.8',
    modelVersion: 'gpt-4-turbo',
    inputSummary: '24h news articles, social media posts, regulatory developments',
    outputSummary: 'Market sentiment: moderately bullish (62/100). Positive regulatory signals offset by macro concerns.',
    confidence: 0.68,
    latencyMs: 1520,
    tokensUsed: 3100,
    status: 'completed',
    createdAt: '2026-05-26T11:15:00Z',
    sources: [
      { sourceType: 'news', sourceId: 'cryptopanic', recordId: 'news_040-050', weight: 0.4 },
      { sourceType: 'social', sourceId: 'lunar_crush', recordId: 'social_020-025', weight: 0.3 },
      { sourceType: 'signal', sourceId: 'finhub', recordId: 'sig_012', weight: 0.3 },
    ],
  },
  {
    id: 'run-003',
    runType: 'signal_generation',
    featureName: 'RSI Divergence Detector',
    promptVersion: 'v3.1',
    modelVersion: 'custom-rsi-v3',
    inputSummary: '1h OHLCV for ETHUSDT across 3 sources, RSI(14) computation',
    outputSummary: 'Bullish RSI divergence detected on ETH/USDT. Price making lower lows, RSI making higher lows.',
    confidence: 0.81,
    latencyMs: 890,
    tokensUsed: 1200,
    status: 'completed',
    createdAt: '2026-05-26T10:45:00Z',
    sources: [
      { sourceType: 'ohlcv', sourceId: 'binance', instrumentId: 'ETHUSDT', recordId: 'ohlcv_1h_042', weight: 0.5 },
      { sourceType: 'ohlcv', sourceId: 'coinbase', instrumentId: 'ETH-USD', recordId: 'ohlcv_1h_042', weight: 0.3 },
      { sourceType: 'tick', sourceId: 'binance', instrumentId: 'ETHUSDT', recordId: 'tick_02341', weight: 0.2 },
    ],
  },
];

const AIProvenancePanel: React.FC = () => {
  const [selectedRun, setSelectedRun] = useState<AiRun>(mockAiRuns[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRunTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment_analysis': return <Brain className="h-4 w-4" />;
      case 'signal_generation': return <GitBranch className="h-4 w-4" />;
      case 'screener': return <Layers className="h-4 w-4" />;
      case 'summarization': return <FileText className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'ohlcv': return <TrendingUp className="h-3 w-3" />;
      case 'news': return <FileText className="h-3 w-3" />;
      case 'onchain': return <Database className="h-3 w-3" />;
      case 'social': return <Brain className="h-3 w-3" />;
      case 'funding': return '💰';
      case 'signal': return <GitBranch className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Provenance & Run Tracking</h2>
        <p className="text-muted-foreground">Trace every AI prediction, signal, and analysis back to its source data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {mockAiRuns.map((run) => (
            <Card
              key={run.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedRun.id === run.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedRun(run)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRunTypeIcon(run.runType)}
                    <div>
                      <CardTitle className="text-sm">{run.featureName}</CardTitle>
                      <CardDescription className="text-xs">{run.runType.replace(/_/g, ' ')}</CardDescription>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(run.status)}`} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getRunTypeIcon(selectedRun.runType)}
                    {selectedRun.featureName}
                  </CardTitle>
                  <CardDescription>
                    Model: {selectedRun.modelVersion} · Prompt: {selectedRun.promptVersion}
                  </CardDescription>
                </div>
                <Badge variant={selectedRun.status === 'completed' ? 'default' : 'secondary'}>
                  {selectedRun.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/20 text-center">
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="text-xl font-bold">{(selectedRun.confidence * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 text-center">
                  <div className="text-xs text-muted-foreground">Latency</div>
                  <div className="text-xl font-bold">{selectedRun.latencyMs}ms</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 text-center">
                  <div className="text-xs text-muted-foreground">Tokens</div>
                  <div className="text-xl font-bold">{selectedRun.tokensUsed.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Input
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/10 p-3 rounded-lg">{selectedRun.inputSummary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Output
                </h4>
                <p className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">{selectedRun.outputSummary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Source Data Lineage
                </h4>
                <div className="space-y-2">
                  {selectedRun.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/10">
                      <div className="flex items-center gap-2">
                        {typeof getSourceTypeIcon(source.sourceType) === 'string' ? (
                          <span>{getSourceTypeIcon(source.sourceType)}</span>
                        ) : (
                          getSourceTypeIcon(source.sourceType)
                        )}
                        <div>
                          <div className="text-sm font-medium">{source.sourceType} · {source.sourceId}</div>
                          <div className="text-xs text-muted-foreground">Record: {source.recordId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{(source.weight * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">weight</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedRun.createdAt}
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  {selectedRun.modelVersion}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIProvenancePanel;