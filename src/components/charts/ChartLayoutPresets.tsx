import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, FolderOpen, Trash2, Layout } from 'lucide-react';

export interface LayoutConfig {
  id: string;
  name: string;
  timestamp: number;
  config: {
    symbols: string[];
    timeframes: string[];
    chartTypes: string[];
    layout: 'single' | '2x1' | '1x2' | '2x2';
    indicators: string[];
    drawingTools: string[];
  };
}

interface ChartLayoutPresetsProps {
  currentConfig: LayoutConfig['config'];
  onLoadLayout: (config: LayoutConfig['config']) => void;
}

const STORAGE_KEY = 'finhub-chart-layouts';

export function ChartLayoutPresets({ currentConfig, onLoadLayout }: ChartLayoutPresetsProps) {
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  // Load saved layouts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLayouts(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading chart layouts:', err);
    }
  }, []);

  const saveLayout = useCallback(() => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    const newLayout: LayoutConfig = {
      id: Date.now().toString(),
      name: layoutName.trim(),
      timestamp: Date.now(),
      config: currentConfig,
    };

    const updated = [...layouts, newLayout];
    setLayouts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaveDialogOpen(false);
    setLayoutName('');
    toast.success(`Layout "${newLayout.name}" saved`);
  }, [layoutName, currentConfig, layouts]);

  const deleteLayout = useCallback((id: string) => {
    const updated = layouts.filter(l => l.id !== id);
    setLayouts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success('Layout deleted');
  }, [layouts]);

  const loadLayout = useCallback((layout: LayoutConfig) => {
    onLoadLayout(layout.config);
    setLoadDialogOpen(false);
    toast.success(`Loaded layout: ${layout.name}`);
  }, [onLoadLayout]);

  return (
    <div className="flex items-center gap-2">
      {/* Save Layout */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 px-2">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Chart Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Layout Name</Label>
              <Input
                placeholder="e.g., BTC Analysis Setup"
                value={layoutName}
                onChange={e => setLayoutName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveLayout()}
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Current configuration includes:</p>
              <ul className="list-disc pl-4">
                <li>Symbols: {currentConfig.symbols.join(', ')}</li>
                <li>Timeframes: {currentConfig.timeframes.join(', ')}</li>
                <li>Layout: {currentConfig.layout}</li>
                <li>Indicators: {currentConfig.indicators.length > 0 ? currentConfig.indicators.join(', ') : 'None'}</li>
              </ul>
            </div>
            <Button onClick={saveLayout} className="w-full">Save Layout</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Layout */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 px-2">
            <FolderOpen className="h-4 w-4 mr-1" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Chart Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
            {layouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved layouts yet.</p>
            ) : (
              layouts.map(layout => (
                <div
                  key={layout.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{layout.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(layout.timestamp).toLocaleDateString()} · {layout.config.layout} · {layout.config.symbols.length} pairs
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => loadLayout(layout)}>
                      <Layout className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => deleteLayout(layout.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChartLayoutPresets;