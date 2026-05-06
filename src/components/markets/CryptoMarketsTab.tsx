import React from 'react';
import CryptoList from '@/components/CryptoList';
import MarketStats from '@/components/MarketStats';

export const CryptoMarketsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Cryptocurrency Markets</h2>
        <p className="text-orange-100">Track and trade top cryptocurrencies</p>
      </div>
      
      <MarketStats />
      <CryptoList />
    </div>
  );
};
