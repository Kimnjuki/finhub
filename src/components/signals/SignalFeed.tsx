import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface SignalFeedProps {
  symbols?: string[];
}

export function SignalFeed({ symbols }: SignalFeedProps) {
  const { streams } = useMarketData();
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Filter for signal updates
    const signalUpdates = streams.filter(
      (s: any) => s.channel === 'unknown' && symbols?.some(sym => s.instrumentId?.includes(sym))
    );

    setSignals(signalUpdates.slice(0, 10)); // Limit to 10 signals
  }, [streams, symbols]);

  return (
    <div className="signal-feed">
      <h3>Trading Signals</h3>
      <div className="signal-list">
        {signals.length === 0 ? (
          <p>No signals available</p>
        ) : (
          signals.map((signal: any, index) => (
            <div key={index} className="signal-item">
              <div className="signal-symbol">{signal.instrumentId}</div>
              <div className="signal-info">
                <div>Strength: {signal.payload?.strength || 'N/A'}</div>
                <div>Confidence: {signal.payload?.confidence || 'N/A'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}