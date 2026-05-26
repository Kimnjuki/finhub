import React from 'react';
import { DataSource, AssetClass, SOURCE_CONFIGS } from '@/services/marketData/types';

interface MultiSourceSelectorProps {
  selectedSources: DataSource[];
  onSourceToggle: (source: DataSource) => void;
  assetClass?: AssetClass;
}

export function MultiSourceSelector({ selectedSources, onSourceToggle, assetClass }: MultiSourceSelectorProps) {
  const sources = Object.entries(SOURCE_CONFIGS)
    .filter(([_, config]) => !assetClass || config.assetClasses.includes(assetClass))
    .sort(([, a], [, b]) => {
      const order = { institutional: 0, exchange: 1, aggregated: 2, reference: 3 };
      return (order[a.quality] || 99) - (order[b.quality] || 99);
    });

  const qualityColors: Record<string, string> = {
    institutional: 'border-purple-500 bg-purple-500/10',
    exchange: 'border-blue-500 bg-blue-500/10',
    aggregated: 'border-green-500 bg-green-500/10',
    reference: 'border-yellow-500 bg-yellow-500/10',
  };

  const qualityLabels: Record<string, string> = {
    institutional: 'Institutional',
    exchange: 'Exchange',
    aggregated: 'Aggregated',
    reference: 'Reference',
  };

  return (
    <div className="multi-source-selector p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Data Sources</h3>
        <span className="text-xs text-muted-foreground">{selectedSources.length} active</span>
      </div>
      
      <div className="space-y-2">
        {sources.map(([id, config]) => {
          const isSelected = selectedSources.includes(id as DataSource);
          const qualityColor = qualityColors[config.quality] || 'border-gray-500';
          
          return (
            <button
              key={id}
              onClick={() => onSourceToggle(id as DataSource)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                isSelected 
                  ? `${qualityColor} border-opacity-50` 
                  : 'border-border/30 opacity-50 hover:opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <div className="text-sm font-medium">{config.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {config.features.slice(0, 4).join(', ')}
                    {config.features.length > 4 && '...'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30">
                  {qualityLabels[config.quality] || config.quality}
                </span>
                {config.wsSupported && (
                  <span className="text-[10px] text-blue-400">WS</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}