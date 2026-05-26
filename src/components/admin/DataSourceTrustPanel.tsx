import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Server, Wifi } from 'lucide-react';

interface SourceReliability {
  id: string;
  name: string;
  type: string;
  region?: string;
  reliability: number;
  uptimePercent?: number;
  latencyMs?: number;
  active: boolean;
  totalStreams: number;
  activeStreams: number;
  healthPercent: number;
  errorRate: number;
  lastMessageAt: number;
}

interface InfrastructureStatus {
  totalSources: number;
  activeSources: number;
  totalStreams: number;
  activeStreams: number;
  staleStreams: number;
  streamHealthPercent: number;
  avgLatencyMs: number;
  lastUpdated: number;
}

export const DataSourceTrustPanel = () => {
  const sourceReliability = useQuery(api.health.getSourceReliability);
  const infraStatus = useQuery(api.health.getInfrastructureStatus);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const getHealthColor = (percent: number) => {
    if (percent >= 95) return 'text-green-500';
    if (percent >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = (percent: number) => {
    if (percent >= 95) return 'bg-green-500/10 border-green-500/20';
    if (percent >= 80) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const formatLastMessage = (ts: number) => {
    if (!ts) return 'Never';
    const diff = Date.now() - ts;
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Infrastructure Health
          </CardTitle>
          <CardDescription>Real-time system monitoring and data pipeline status</CardDescription>
        </CardHeader>
        <CardContent>
          {infraStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Sources</span>
                </div>
                <p className="text-2xl font-bold">{infraStatus.activeSources}/{infraStatus.totalSources}</p>
                <p className="text-xs text-muted-foreground">Active sources</p>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Streams</span>
                </div>
                <p className="text-2xl font-bold">{infraStatus.activeStreams}/{infraStatus.totalStreams}</p>
                <p className="text-xs text-muted-foreground">Active streams</p>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Health</span>
                </div>
                <p className={`text-2xl font-bold ${getHealthColor(infraStatus.streamHealthPercent)}`}>
                  {infraStatus.streamHealthPercent}%
                </p>
                <Progress value={infraStatus.streamHealthPercent} className="h-1 mt-2" />
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Latency</span>
                </div>
                <p className={`text-2xl font-bold ${infraStatus.avgLatencyMs < 1000 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {infraStatus.avgLatencyMs}ms
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Source Reliability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source Reliability
          </CardTitle>
          <CardDescription>
            Trust layer - transparent metrics on data source quality, latency, and stream health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceReliability?.map((source: SourceReliability) => (
              <div
                key={source.id}
                className={`p-4 rounded-lg border ${getHealthBg(source.healthPercent)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${source.active ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {source.active 
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <AlertTriangle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div>
                      <h4 className="font-semibold capitalize">{source.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{source.type}</Badge>
                        {source.region && <span>{source.region}</span>}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={source.healthPercent >= 95 ? 'default' : source.healthPercent >= 80 ? 'secondary' : 'destructive'}
                  >
                    {source.healthPercent}% Health
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Streams</p>
                    <p className="text-sm font-medium">{source.activeStreams}/{source.totalStreams} active</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reliability</p>
                    <p className="text-sm font-medium">{(source.reliability * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Latency</p>
                    <p className="text-sm font-medium">{source.latencyMs ? `${source.latencyMs}ms` : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <Progress value={source.healthPercent} className="h-1 flex-1 mr-4" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Last message: {formatLastMessage(source.lastMessageAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Layer Explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Data Trust & Lineage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-background/50">
              <h4 className="text-sm font-semibold mb-1">🔄 Data Lineage</h4>
              <p className="text-xs text-muted-foreground">
                Every data point is tracked from source to display. View exact timestamps, 
                sequence numbers, and processing latency for each message.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <h4 className="text-sm font-semibold mb-1">📊 Source Transparency</h4>
              <p className="text-xs text-muted-foreground">
                We show you exactly which exchange provided each data point, when it was received, 
                and its health status. No black boxes.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <h4 className="text-sm font-semibold mb-1">🔍 Stream Health</h4>
              <p className="text-xs text-muted-foreground">
                Real-time monitoring of every WebSocket connection. If a stream goes stale, 
                we detect it within 30 seconds and display the status transparently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourceTrustPanel;