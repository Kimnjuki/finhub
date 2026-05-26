import React from 'react';
import { MarketTabs } from '@/components/markets/MarketTabs';
import SEOHead from '@/components/SEOHead';

const Markets: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Markets - Crypto & Fortune 500 Stocks | FINHUBAFRICA"
        description="Track real-time cryptocurrency and Fortune 500 stock prices with AI-powered trading signals. Get market analysis, technical indicators, and trading recommendations."
        keywords="cryptocurrency market, stock market, Fortune 500 stocks, crypto trading, stock trading, market analysis, trading signals"
      />
      <div className="min-h-screen bg-background">
        <MarketTabs symbols={['BTC-USD', 'ETH-USD']} />
      </div>
    </>
  );
};

export default Markets;
