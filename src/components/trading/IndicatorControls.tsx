import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export interface IndicatorSettings {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  ema12: boolean;
  ema26: boolean;
  bollingerBands: boolean;
  vwap: boolean;
}

interface IndicatorControlsProps {
  settings: IndicatorSettings;
  onChange: (settings: IndicatorSettings) => void;
  onOpenSettings: () => void;
}

export const IndicatorControls = ({ settings, onChange, onOpenSettings }: IndicatorControlsProps) => {
  const handleToggle = (key: keyof IndicatorSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Technical Indicators</h3>
        <Button size="sm" variant="outline" onClick={onOpenSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="sma20"
            checked={settings.sma20}
            onCheckedChange={() => handleToggle('sma20')}
          />
          <Label htmlFor="sma20" className="text-xs cursor-pointer">
            SMA 20 <span className="text-yellow-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="sma50"
            checked={settings.sma50}
            onCheckedChange={() => handleToggle('sma50')}
          />
          <Label htmlFor="sma50" className="text-xs cursor-pointer">
            SMA 50 <span className="text-orange-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="sma200"
            checked={settings.sma200}
            onCheckedChange={() => handleToggle('sma200')}
          />
          <Label htmlFor="sma200" className="text-xs cursor-pointer">
            SMA 200 <span className="text-purple-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="ema12"
            checked={settings.ema12}
            onCheckedChange={() => handleToggle('ema12')}
          />
          <Label htmlFor="ema12" className="text-xs cursor-pointer">
            EMA 12 <span className="text-blue-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="ema26"
            checked={settings.ema26}
            onCheckedChange={() => handleToggle('ema26')}
          />
          <Label htmlFor="ema26" className="text-xs cursor-pointer">
            EMA 26 <span className="text-red-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="bollingerBands"
            checked={settings.bollingerBands}
            onCheckedChange={() => handleToggle('bollingerBands')}
          />
          <Label htmlFor="bollingerBands" className="text-xs cursor-pointer">
            Bollinger Bands <span className="text-cyan-500">●</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="vwap"
            checked={settings.vwap}
            onCheckedChange={() => handleToggle('vwap')}
          />
          <Label htmlFor="vwap" className="text-xs cursor-pointer">
            VWAP <span className="text-green-500">●</span>
          </Label>
        </div>
      </div>
    </Card>
  );
};
