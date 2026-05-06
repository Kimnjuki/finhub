import { useMarketData } from "@/contexts/MarketDataContext";
import PriceTickerCard from "./PriceTickerCard";
import CurrencySelector from "./CurrencySelector";
import PriceAlertBadge from "./PriceAlertBadge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LivePriceGrid = () => {
  const { cryptoData, isLoading, refetch } = useMarketData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Live Market Data</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-primary/20 hover:border-primary/40"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <PriceAlertBadge />
          <CurrencySelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cryptoData?.map((crypto) => (
          <PriceTickerCard key={crypto.id} crypto={crypto} />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Data updates every 10 seconds • WebSocket connection for real-time prices</p>
        <p className="text-xs mt-1">Powered by CoinGecko & CoinCap APIs</p>
      </div>
    </div>
  );
};

export default LivePriceGrid;
