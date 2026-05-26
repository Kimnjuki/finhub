import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, BarChart3, Clock, Database, RefreshCw, Shield, TrendingUp } from "lucide-react";

interface MetricRow {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  change?: string;
}

interface ExchangeMetric {
  name: string;
  sourceType: string;
  latencyP50: number;
  latencyP99: number;
  uptime24h: number;
  uptime30d: number;
  spreadAvg: number;
  depth1pct: number;
  volume24h: number;
  errorRate: number;
  streamFreshnessMs: number;
  status: 'connected' | 'degraded' | 'error';
}

const mockExchangeMetrics: ExchangeMetric[] = [
  { name: 'Binance', sourceType: 'exchange', latencyP50: 12, latencyP99: 45, uptime24h: 99.99, uptime30d: 99.97, spreadAvg: 0.01, depth1pct: 12500000, volume24h: 87500000000, errorRate: 0.001, streamFreshnessMs: 18, status: 'connected' },
  { name: 'Coinbase', sourceType: 'exchange', latencyP50: 18, latencyP99: 62, uptime24h: 99.98, uptime30d: 99.95, spreadAvg: 0.02, depth1pct: 8900000, volume24h: 42000000000, errorRate: 0.002, streamFreshnessMs: 24, status: 'connected' },
  { name: 'Kraken', sourceType: 'exchange', latencyP50: 22, latencyP99: 78, uptime24h: 99.95, uptime30d: 99.91, spreadAvg: 0.03, depth1pct: 5600000, volume24h: 18000000000, errorRate: 0.003, streamFreshnessMs: 31, status: 'connected' },
  { name: 'Bybit', sourceType: 'exchange', latencyP50: 15, latencyP99: 52, uptime24h: 99.97, uptime30d: 99.94, spreadAvg: 0.01, depth1pct: 10200000, volume24h: 63000000000, errorRate: 0.002, streamFreshnessMs: 21, status: 'connected' },
  { name: 'OKX', sourceType: 'exchange', latencyP50: 20, latencyP99: 71, uptime24h: 99.93, uptime30d: 99.89, spreadAvg: 0.02, depth1pct: 7800000, volume24h: 35000000000, errorRate: 0.004, streamFreshnessMs: 28, status: 'connected' },
];

const ExchangeMetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<ExchangeMetric[]>(mockExchangeMetrics);
  const [sortField, setSortField] = useState<string>('latencyP50');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => {
    const aVal = a[sortField as keyof ExchangeMetric] as number;
    const bVal = b[sortField as keyof ExchangeMetric] as number;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricRows = (exchange: ExchangeMetric): MetricRow[] => [
    { label: 'P50 Latency', value: `${exchange.latencyP50}ms`, status: exchange.latencyP50 < 15 ? 'good' : exchange.latencyP50 < 25 ? 'warning' : 'critical' },
    { label: 'P99 Latency', value: `${exchange.latencyP99}ms`, status: exchange.latencyP99 < 60 ? 'good' : exchange.latencyP99 < 100 ? 'warning' : 'critical' },
    { label: '24h Uptime', value: `${exchange.uptime24h}%`, status: exchange.uptime24h > 99.95 ? 'good' : exchange.uptime24h > 99.9 ? 'warning' : 'critical' },
    { label: '30d Uptime', value: `${exchange.uptime30d}%`, status: exchange.uptime30d > 99.9 ? 'good' : exchange.uptime30d > 99.8 ? 'warning' : 'critical' },
    { label: 'Avg Spread', value: `${exchange.spreadAvg}%`, status: exchange.spreadAvg < 0.03 ? 'good' : exchange.spreadAvg < 0.05 ? 'warning' : 'critical' },
    { label: 'Depth (1%)', value: `$${(exchange.depth1pct / 1e6).toFixed(1)}M`, status: exchange.depth1pct > 5000000 ? 'good' : exchange.depth1pct > 1000000 ? 'warning' : 'critical' },
    { label: '24h Volume', value: `$${(exchange.volume24h / 1e9).toFixed(1)}B`, status: exchange.volume24h > 20000000000 ? 'good' : exchange.volume24h > 5000000000 ? 'warning' : 'critical' },
    { label: 'Error Rate', value: `${exchange.errorRate}%`, status: exchange.errorRate < 0.002 ? 'good' : exchange.errorRate < 0.005 ? 'warning' : 'critical' },
    { label: 'Stream Freshness', value: `${exchange.streamFreshnessMs}ms`, status: exchange.streamFreshnessMs < 25 ? 'good' : exchange.streamFreshnessMs < 50 ? 'warning' : 'critical' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exchange Performance Metrics</h2>
          <p className="text-muted-foreground">Real-time comparison of exchange quality, latency, and liquidity</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {}}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedMetrics.slice(0, 3).map((exchange, idx) => (
          <Card key={idx} className={`border-l-4 ${exchange.status === 'connected' ? 'border-l-green-500' : exchange.status === 'degraded' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(exchange.status)}`} />
                  <CardTitle className="text-lg">{exchange.name}</CardTitle>
                </div>
                <Badge variant={exchange.status === 'connected' ? 'default' : 'secondary'}>
                  {exchange.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">P50</div>
                  <div className="text-lg font-bold">{exchange.latencyP50}ms</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <div className="text-lg font-bold">{exchange.uptime24h}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Vol 24h</div>
                  <div className="text-lg font-bold">${(exchange.volume24h / 1e9).toFixed(1)}B</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparison Matrix
          </CardTitle>
          <CardDescription>Click column headers to sort. Green = best-in-class.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Exchange</th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('latencyP50')}>
                    P50 {sortField === 'latencyP50' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('latencyP99')}>
                    P99 {sortField === 'latencyP99' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('uptime24h')}>
                    Uptime {sortField === 'uptime24h' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('spreadAvg')}>
                    Spread {sortField === 'spreadAvg' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('depth1pct')}>
                    Depth {sortField === 'depth1pct' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('volume24h')}>
                    Volume {sortField === 'volume24h' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-right py-2 px-3 font-semibold cursor-pointer hover:text-primary" onClick={() => handleSort('errorRate')}>
                    Errors {sortField === 'errorRate' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.map((exchange, idx) => {
                  const bestLatency = Math.min(...sortedMetrics.map(m => m.latencyP50));
                  const bestUptime = Math.max(...sortedMetrics.map(m => m.uptime24h));
                  const bestSpread = Math.min(...sortedMetrics.map(m => m.spreadAvg));
                  const bestDepth = Math.max(...sortedMetrics.map(m => m.depth1pct));
                  return (
                    <tr key={idx} className="border-b border-muted/30 hover:bg-muted/20">
                      <td className="py-3 px-3 font-medium">{exchange.name}</td>
                      <td className={`text-right py-3 px-3 ${exchange.latencyP50 === bestLatency ? 'text-green-500 font-bold' : ''}`}>{exchange.latencyP50}ms</td>
                      <td className="text-right py-3 px-3">{exchange.latencyP99}ms</td>
                      <td className={`text-right py-3 px-3 ${exchange.uptime24h === bestUptime ? 'text-green-500 font-bold' : ''}`}>{exchange.uptime24h}%</td>
                      <td className={`text-right py-3 px-3 ${exchange.spreadAvg === bestSpread ? 'text-green-500 font-bold' : ''}`}>{exchange.spreadAvg}%</td>
                      <td className={`text-right py-3 px-3 ${exchange.depth1pct === bestDepth ? 'text-green-500 font-bold' : ''}`}>${(exchange.depth1pct / 1e6).toFixed(1)}M</td>
                      <td className="text-right py-3 px-3">${(exchange.volume24h / 1e9).toFixed(1)}B</td>
                      <td className="text-right py-3 px-3">{exchange.errorRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detailed Metrics — {sortedMetrics[0]?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getMetricRows(sortedMetrics[0]).map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${row.status === 'good' ? 'bg-green-500' : row.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-sm">{row.label}</span>
                </div>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeMetricsPanel;