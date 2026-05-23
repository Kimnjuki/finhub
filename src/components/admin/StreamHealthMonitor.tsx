import React, { useEffect, useState } from 'react';

interface StreamHealthMonitorProps {
  symbols?: string[];
}

export function StreamHealthMonitor({ symbols }: StreamHealthMonitorProps) {
  const [health, setHealth] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching stream health data
  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        const mockHealth = [
          { source: 'binance', channels: [{ name: 'trades', status: 'active', latency: '50ms' }, { name: 'orderbook_l2', status: 'active', latency: '30ms' }] },
          { source: 'coinbase', channels: [{ name: 'matches', status: 'active', latency: '100ms' }, { name: 'level2', status: 'active', latency: '80ms' }] },
          { source: 'kraken', channels: [{ name: 'trade', status: 'stale', latency: '500ms' }] },
        ];
        setHealth(mockHealth);
        setIsLoading(false);
      }
    }, 1000);
    
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <div>Loading stream health...</div>;
  }

  return (
    <div className="stream-health-monitor">
      <h3>Stream Health</h3>
      {health.length === 0 ? (
        <p>No health data</p>
      ) : (
        <div className="health-status">
          {health.map((source: any, idx) => (
            <div key={idx} className="health-source">
              <div className="source-name">{source.source}</div>
              {source.channels.map((channel: any) => (
                <div key={channel.name} className="channel-status">
                  <span>{channel.name}</span>
                  <span className={`status-${channel.status}`}>{channel.status} ({channel.latency})</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}