import { AssetClass, DataSource, SOURCE_CONFIGS, SourceConfig } from '../types';

/**
 * Auto-selects the best data source for a given asset, prioritizing:
 * 1. Institutional quality > Exchange > Aggregated > Reference
 * 2. WebSocket support for real-time
 * 3. Specific asset class coverage
 * 4. Rate limit availability
 */
export class SourceSelector {
  private sourcePriority: Record<DataSource, number>;

  constructor() {
    this.sourcePriority = this.buildPriorityMap();
  }

  private buildPriorityMap(): Record<DataSource, number> {
    const qualityOrder: Record<string, number> = {
      institutional: 4,
      exchange: 3,
      aggregated: 2,
      reference: 1,
    };

    const priorities: Record<DataSource, number> = {} as Record<DataSource, number>;
    
    for (const [sourceId, config] of Object.entries(SOURCE_CONFIGS)) {
      let score = qualityOrder[config.quality] || 0;
      if (config.wsSupported) score += 2;
      if (!config.requiresAuth) score += 1;
      priorities[sourceId as DataSource] = score;
    }
    
    return priorities;
  }

  getBestSource(
    assetClass: AssetClass,
    feature: string,
    preferRealTime: boolean = false
  ): DataSource {
    const candidates = this.getSourcesForAsset(assetClass, feature, preferRealTime);
    if (candidates.length === 0) throw new Error(`No source found for ${assetClass}/${feature}`);
    return candidates[0];
  }

  getAllSources(
    assetClass: AssetClass,
    feature: string
  ): DataSource[] {
    return this.getSourcesForAsset(assetClass, feature, false);
  }

  private getSourcesForAsset(
    assetClass: AssetClass,
    feature: string,
    preferRealTime: boolean
  ): DataSource[] {
    const sources = Object.values(SOURCE_CONFIGS)
      .filter(config => {
        if (!config.assetClasses.includes(assetClass)) return false;
        if (!config.features.includes(feature)) return false;
        if (preferRealTime && !config.wsSupported) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityDiff = (this.sourcePriority[b.sourceId] || 0) - (this.sourcePriority[a.sourceId] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        // Tiebreaker: higher rate limit = better
        return b.rateLimit - a.rateLimit;
      });

    return sources.map(s => s.sourceId);
  }

  getSourceConfig(sourceId: DataSource): SourceConfig {
    return SOURCE_CONFIGS[sourceId];
  }

  isFeatureSupported(sourceId: DataSource, feature: string): boolean {
    return SOURCE_CONFIGS[sourceId]?.features.includes(feature) || false;
  }

  getSupportedAssetClasses(): AssetClass[] {
    const classes = new Set<AssetClass>();
    Object.values(SOURCE_CONFIGS).forEach(config => {
      config.assetClasses.forEach(ac => classes.add(ac));
    });
    return Array.from(classes);
  }

  getFeatureMatrix(): Record<DataSource, { assetClasses: AssetClass[]; features: string[] }> {
    const matrix: Record<string, any> = {};
    for (const [id, config] of Object.entries(SOURCE_CONFIGS)) {
      matrix[id] = {
        assetClasses: config.assetClasses,
        features: config.features,
      };
    }
    return matrix as any;
  }
}

export const sourceSelector = new SourceSelector();