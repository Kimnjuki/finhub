import React, { useState, useEffect } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface AlertManagerProps {
  symbols?: string[];
}

export function AlertManager({ symbols }: AlertManagerProps) {
  const { streams } = useMarketData();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Filter alerts for the given symbols
    const filteredAlerts = streams.filter(
      (s: any) => s.channel === 'trades' && symbols?.includes(s.instrumentId)
    );

    setAlerts(filteredAlerts);
  }, [streams, symbols]);

  return (
    <div className="alert-manager">
      <h3>Active Alerts</h3>
      {alerts.length === 0 ? (
        <p>No active alerts</p>
      ) : (
        <ul>
          {alerts.map((alert: any, index) => (
            <li key={index}>
              {alert.instrumentId}: {alert.payload?.p || alert.payload?.price || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}