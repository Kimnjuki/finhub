import React, { useState } from 'react';
import { fortune500Stocks } from '@/data/fortune500Stocks';
import { StockCard } from './StockCard';
import { useStockData } from '@/hooks/useStockData';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StockCardWrapper: React.FC<{ symbol: string; name: string; logo: string }> = ({ symbol, name, logo }) => {
  const { stock, signal, loading, error } = useStockData(symbol);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stock || !signal) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
        <p className="text-muted-foreground">Unable to load {symbol}</p>
      </div>
    );
  }

  return <StockCard stock={{ ...stock, name }} signal={signal} logo={logo} />;
};

export const Fortune500Tab: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sectors = ['all', ...new Set(fortune500Stocks.map(s => s.sector))];

  const filteredStocks = fortune500Stocks.filter(stock => {
    const matchesSector = filter === 'all' || stock.sector === filter;
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Fortune 500 Stocks</h2>
        <p className="text-blue-100">Real-time stock prices with AI-powered trading signals</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>
                {sector.charAt(0).toUpperCase() + sector.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map(stock => (
          <StockCardWrapper
            key={stock.symbol}
            symbol={stock.symbol}
            name={stock.name}
            logo={stock.logo}
          />
        ))}
      </div>
    </div>
  );
};
