import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface StreamHealthMonitorProps {
  symbols?: string[];
}

export function StreamHealthMonitor({ symbols }: StreamHealthMonitorProps) {
  const { streams } = useMarketData();
  const [streamHealth, setStreamHealth] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Filter for stream health updates
    const healthStream = streams.find(
      (s: any) => s.channel === 'stream_health' && symbols?.some(sym => s.instrumentId?.includes(sym))
    );

    if (healthStream) {
      setStreamHealth([healthStream.payload]);
    }
  }, [streams, symbols]);

  return (
    <div className="stream-health-monitor">
      <h3>Stream Health</h3>
      <div className="health-status">
        {streamHealth.length === 0 ? (
          <p>No health data available</p>
        ) : (
          <div className="health-item">
            <div>Status: {streamHealth[0]?.status || 'unknown'}</div>
            <div>Last check: {new Date(streamHealth[0]?.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}