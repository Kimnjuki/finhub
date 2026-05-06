import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, Wifi, WifiOff } from "lucide-react";
import { useMarketData } from "@/contexts/MarketDataContext";

const PriceAlertBadge = () => {
  const { wsConnected } = useMarketData();

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={wsConnected ? "default" : "secondary"}
        className="flex items-center gap-1.5 px-3 py-1"
      >
        {wsConnected ? (
          <>
            <Wifi className="w-3 h-3 animate-pulse" />
            <span className="text-xs font-medium">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span className="text-xs font-medium">Polling</span>
          </>
        )}
      </Badge>
      
      <Badge 
        variant="outline" 
        className="flex items-center gap-1.5 px-3 py-1 border-primary/30"
      >
        <BellRing className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-xs font-medium">Alerts Active</span>
      </Badge>
    </div>
  );
};

export default PriceAlertBadge;
