import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { marketDataService } from "@/services/marketData";

// Route through Vite proxy in development to avoid CORS issues
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const fetchCryptoData = async () => {
  // Try CoinGecko first (free, no API key needed)
  const baseUrl = isDev
    ? '/api/coingecko'
    : 'https://api.coingecko.com';
  
  try {
    const response = await fetch(`${baseUrl}/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false`);
    if (response.ok) {
      return response.json();
    }
  } catch (e) {
    console.warn('[CryptoList] CoinGecko unavailable, using MarketDataService');
  }
  
  // Fallback: use the multi-source market data service
  const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD'];
  const quotes = await marketDataService.getQuotes(symbols, 'crypto');
  const rankings = await marketDataService.getCryptoRankings(5);
  
  return rankings.map(r => ({
    id: r.symbol.toLowerCase(),
    symbol: r.symbol,
    name: r.name,
    current_price: r.price,
    price_change_percentage_24h: r.change24h,
    total_volume: r.volume24h,
    market_cap: r.marketCap,
    image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${r.symbol.toLowerCase()}.png`,
  }));
};

const CryptoList = () => {
  const [apiSource, setApiSource] = useState<string>('coingecko');
  
  const { data: cryptos, isLoading, error } = useQuery({
    queryKey: ['cryptos'],
    queryFn: async () => {
      const data = await fetchCryptoData();
      setApiSource('Multi-Source (CoinGecko + Polygon + TwelveData + Alpha Vantage)');
      return data;
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading live crypto data...</div>;
  }

  if (error || !cryptos) {
    return (
      <div className="glass-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Top Cryptocurrencies</h2>
        <p className="text-muted-foreground">Unable to fetch live data. Please check your connection.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Top Cryptocurrencies</h2>
        <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
          Live from {apiSource}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Name</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">24h Change</th>
              <th className="pb-4">Volume</th>
            </tr>
          </thead>
          <tbody>
            {cryptos?.map((crypto) => (
              <tr key={crypto.symbol} className="border-t border-secondary">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/32x32/1a1a2e/e94560?text=${crypto.symbol?.charAt(0) || '?'}`;
                      }}
                    />
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-sm text-muted-foreground">{crypto.symbol?.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">${crypto.current_price?.toLocaleString() || 'N/A'}</td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      crypto.price_change_percentage_24h >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">${(crypto.total_volume / 1e9).toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;