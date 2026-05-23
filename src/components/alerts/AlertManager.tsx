import React, { useEffect, useState } from 'react';

interface AlertManagerProps {
  symbols?: string[];
}

export function AlertManager({ symbols }: AlertManagerProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userAlerts, setUserAlerts] = useState<any[]>([]);

  // Simulate fetching user alerts
  useEffect(() => {
    const mockAlerts = [
      { type: 'price_above', instrument: 'BTC-USD', conditionConfig: { threshold: 50000 } },
      { type: 'price_below', instrument: 'ETH-USD', conditionConfig: { threshold: 3000 } },
    ];
    setUserAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    // Transform user alerts into displayable format
    const displayAlerts = userAlerts.map(alert => {
      // Format based on alert type
      let message = '';
      switch (alert.type) {
        case 'price_above':
          message = `Price above $${alert.conditionConfig.threshold}`;
          break;
        case 'price_below':
          message = `Price below $${alert.conditionConfig.threshold}`;
          break;
        case 'price_pct_change':
          message = `Price changed ${alert.conditionConfig.pct}%`;
          break;
        default:
          message = `Alert: ${alert.type}`;
      }
      return {
        ...alert,
        message,
        instrumentName: alert.instrument,
      };
    });

    setAlerts(displayAlerts);
  }, [userAlerts]);

  return (
    <div className="alert-manager">
      <h3>Active Alerts</h3>
      {alerts.length === 0 ? (
        <p>No active alerts</p>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert: any, index) => (
            <li key={index} className="alert-item">
              <div className="alert-symbol">{alert.instrumentName}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-status">Active</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}