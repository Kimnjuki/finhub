import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ComparisonAsset {
  symbol: string;
  name: string;
  color: string;
}

interface AssetSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  comparisonAssets: ComparisonAsset[];
  onAddComparison: (asset: ComparisonAsset) => void;
  onRemoveComparison: (symbol: string) => void;
  percentageMode: boolean;
  onPercentageModeChange: (enabled: boolean) => void;
  syncScales: boolean;
  onSyncScalesChange: (enabled: boolean) => void;
}

const AVAILABLE_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'Solana', color: '#14F195' },
  { symbol: 'ADAUSDT', name: 'Cardano', color: '#0033AD' },
  { symbol: 'XRPUSDT', name: 'XRP', color: '#23292F' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', color: '#C2A633' },
  { symbol: 'DOTUSDT', name: 'Polkadot', color: '#E6007A' },
];

export const AssetSelector = ({
  selectedSymbol,
  onSymbolChange,
  comparisonAssets,
  onAddComparison,
  onRemoveComparison,
  percentageMode,
  onPercentageModeChange,
  syncScales,
  onSyncScalesChange,
}: AssetSelectorProps) => {
  const [newAssetSymbol, setNewAssetSymbol] = useState<string>('');

  const handleAddComparison = () => {
    if (!newAssetSymbol || newAssetSymbol === selectedSymbol) return;
    
    const existingAsset = comparisonAssets.find(a => a.symbol === newAssetSymbol);
    if (existingAsset) return;

    const asset = AVAILABLE_ASSETS.find(a => a.symbol === newAssetSymbol);
    if (asset) {
      onAddComparison(asset);
      setNewAssetSymbol('');
    }
  };

  const availableForComparison = AVAILABLE_ASSETS.filter(
    asset => asset.symbol !== selectedSymbol && !comparisonAssets.find(a => a.symbol === asset.symbol)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Primary Asset</Label>
        <Select value={selectedSymbol} onValueChange={onSymbolChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ASSETS.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                {asset.name} ({asset.symbol.replace('USDT', '')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {comparisonAssets.length > 0 && (
        <div className="space-y-2">
          <Label>Comparison Assets</Label>
          <div className="flex flex-wrap gap-2">
            {comparisonAssets.map((asset) => (
              <Badge key={asset.symbol} variant="secondary" className="gap-2">
                <span style={{ color: asset.color }}>●</span>
                {asset.name}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => onRemoveComparison(asset.symbol)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {availableForComparison.length > 0 && (
        <div className="space-y-2">
          <Label>Add Comparison</Label>
          <div className="flex gap-2">
            <Select value={newAssetSymbol} onValueChange={setNewAssetSymbol}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select asset to compare" />
              </SelectTrigger>
              <SelectContent>
                {availableForComparison.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol.replace('USDT', '')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" onClick={handleAddComparison} disabled={!newAssetSymbol}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {comparisonAssets.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="percentage-mode">Percentage Change View</Label>
            <Switch
              id="percentage-mode"
              checked={percentageMode}
              onCheckedChange={onPercentageModeChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-scales">Sync Price Scales</Label>
            <Switch
              id="sync-scales"
              checked={syncScales}
              onCheckedChange={onSyncScalesChange}
              disabled={percentageMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};
