import React, { useEffect, useState } from 'react';

interface SignalFeedProps {
  symbols?: string[];
}

export function SignalFeed({ symbols }: SignalFeedProps) {
  const [signals, setSignals] = useState<any[]>([]);
  const [signalData, setSignalData] = useState<any[]>([]);

  // Simulate fetching signals
  useEffect(() => {
    const mockSignals = [
      { symbol: 'BTC-USD', strength: 0.8, confidence: 0.9, direction: 'bullish', type: 'momentum', timestamp: Date.now() },
      { symbol: 'ETH-USD', strength: 0.6, confidence: 0.7, direction: 'bearish', type: 'mean_reversion', timestamp: Date.now() },
    ];
    setSignalData(mockSignals);
  }, []);

  useEffect(() => {
    // Transform signal data into displayable format
    const displaySignals = signalData.map(signal => ({
      ...signal,
      message: `Signal: ${signal.direction} ${signal.type} for ${signal.symbol}`,
    }));

    setSignals(displaySignals);
  }, [signalData]);

  return (
    <div className="signal-feed">
      <h3>Trading Signals</h3>
      <div className="signal-list">
        {signals.length === 0 ? (
          <p>No signals available</p>
        ) : (
          signals.map((signal: any, index) => (
            <div key={index} className="signal-item">
              <div className="signal-symbol">{signal.symbol}</div>
              <div className="signal-info">
                <div>Direction: {signal.direction}</div>
                <div>Strength: {signal.strength}</div>
                <div>Confidence: {signal.confidence}</div>
                <div>Type: {signal.type}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}