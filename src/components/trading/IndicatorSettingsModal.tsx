import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface IndicatorCustomSettings {
  sma: { period1: number; period2: number; period3: number };
  ema: { period1: number; period2: number };
  bollinger: { period: number; stdDev: number };
  rsi: { period: number; overbought: number; oversold: number };
  macd: { fast: number; slow: number; signal: number };
  stochastic: { kPeriod: number; dPeriod: number };
}

interface IndicatorSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: IndicatorCustomSettings;
  onSave: (settings: IndicatorCustomSettings) => void;
}

export const IndicatorSettingsModal = ({
  open,
  onOpenChange,
  settings,
  onSave,
}: IndicatorSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaults: IndicatorCustomSettings = {
      sma: { period1: 20, period2: 50, period3: 200 },
      ema: { period1: 12, period2: 26 },
      bollinger: { period: 20, stdDev: 2 },
      rsi: { period: 14, overbought: 70, oversold: 30 },
      macd: { fast: 12, slow: 26, signal: 9 },
      stochastic: { kPeriod: 14, dPeriod: 3 },
    };
    setLocalSettings(defaults);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Indicator Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="ma" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ma">Moving Averages</TabsTrigger>
            <TabsTrigger value="bollinger">Bollinger</TabsTrigger>
            <TabsTrigger value="rsi">RSI</TabsTrigger>
            <TabsTrigger value="macd">MACD/Stoch</TabsTrigger>
          </TabsList>

          <TabsContent value="ma" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Simple Moving Average (SMA)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sma1">SMA 1 Period</Label>
                  <Input
                    id="sma1"
                    type="number"
                    value={localSettings.sma.period1}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        sma: { ...localSettings.sma, period1: parseInt(e.target.value) || 20 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sma2">SMA 2 Period</Label>
                  <Input
                    id="sma2"
                    type="number"
                    value={localSettings.sma.period2}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        sma: { ...localSettings.sma, period2: parseInt(e.target.value) || 50 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sma3">SMA 3 Period</Label>
                  <Input
                    id="sma3"
                    type="number"
                    value={localSettings.sma.period3}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        sma: { ...localSettings.sma, period3: parseInt(e.target.value) || 200 },
                      })
                    }
                  />
                </div>
              </div>

              <h4 className="font-semibold mt-6">Exponential Moving Average (EMA)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ema1">EMA 1 Period</Label>
                  <Input
                    id="ema1"
                    type="number"
                    value={localSettings.ema.period1}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        ema: { ...localSettings.ema, period1: parseInt(e.target.value) || 12 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ema2">EMA 2 Period</Label>
                  <Input
                    id="ema2"
                    type="number"
                    value={localSettings.ema.period2}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        ema: { ...localSettings.ema, period2: parseInt(e.target.value) || 26 },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bollinger" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Bollinger Bands</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bb-period">Period</Label>
                  <Input
                    id="bb-period"
                    type="number"
                    value={localSettings.bollinger.period}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        bollinger: {
                          ...localSettings.bollinger,
                          period: parseInt(e.target.value) || 20,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bb-stddev">Standard Deviation</Label>
                  <Input
                    id="bb-stddev"
                    type="number"
                    step="0.1"
                    value={localSettings.bollinger.stdDev}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        bollinger: {
                          ...localSettings.bollinger,
                          stdDev: parseFloat(e.target.value) || 2,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rsi" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">RSI Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rsi-period">Period</Label>
                  <Input
                    id="rsi-period"
                    type="number"
                    value={localSettings.rsi.period}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        rsi: { ...localSettings.rsi, period: parseInt(e.target.value) || 14 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsi-overbought">Overbought Level</Label>
                  <Input
                    id="rsi-overbought"
                    type="number"
                    value={localSettings.rsi.overbought}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        rsi: { ...localSettings.rsi, overbought: parseInt(e.target.value) || 70 },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsi-oversold">Oversold Level</Label>
                  <Input
                    id="rsi-oversold"
                    type="number"
                    value={localSettings.rsi.oversold}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        rsi: { ...localSettings.rsi, oversold: parseInt(e.target.value) || 30 },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="macd" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">MACD Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="macd-fast">Fast Period</Label>
                    <Input
                      id="macd-fast"
                      type="number"
                      value={localSettings.macd.fast}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          macd: { ...localSettings.macd, fast: parseInt(e.target.value) || 12 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="macd-slow">Slow Period</Label>
                    <Input
                      id="macd-slow"
                      type="number"
                      value={localSettings.macd.slow}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          macd: { ...localSettings.macd, slow: parseInt(e.target.value) || 26 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="macd-signal">Signal Period</Label>
                    <Input
                      id="macd-signal"
                      type="number"
                      value={localSettings.macd.signal}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          macd: { ...localSettings.macd, signal: parseInt(e.target.value) || 9 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Stochastic Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stoch-k">%K Period</Label>
                    <Input
                      id="stoch-k"
                      type="number"
                      value={localSettings.stochastic.kPeriod}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stochastic: {
                            ...localSettings.stochastic,
                            kPeriod: parseInt(e.target.value) || 14,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stoch-d">%D Period</Label>
                    <Input
                      id="stoch-d"
                      type="number"
                      value={localSettings.stochastic.dPeriod}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stochastic: {
                            ...localSettings.stochastic,
                            dPeriod: parseInt(e.target.value) || 3,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
