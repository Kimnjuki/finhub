import { AggregatedQuote, MarketDataPoint, DataSource, AssetClass } from '../types';

/**
 * Cross-source price aggregation engine
 * Features:
 * - Median price calculation across sources (robust to outliers)
 * - Volume-weighted average price (VWAP)
 * - Confidence scoring based on source count and quality
 * - Spread calculation from bid/ask data
 * - Outlier detection and rejection
 */
export class Aggregator {
  /**
   * Aggregate price quotes from multiple sources into a single unified quote
   */
  aggregateQuotes(points: MarketDataPoint[]): AggregatedQuote | null {
    if (points.length === 0) return null;

    const symbol = points[0].symbol;
    const assetClass = points[0].assetClass;
    
    // Extract prices for median calculation
    const prices = points
      .filter(p => p.price > 0)
      .map(p => p.price);
    
    if (prices.length === 0) return null;

    // Calculate median price (robust to outliers)
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = this.median(sortedPrices);
    
    // Detect and filter outliers using IQR
    const cleanPoints = this.filterOutliers(points);
    const cleanPrices = cleanPoints.map(p => p.price);
    
    // Volume-weighted average if volume data available
    const volumeData = points.filter(p => p.volume && p.volume > 0);
    let vwap: number | undefined;
    if (volumeData.length > 0) {
      const totalValue = volumeData.reduce((sum, p) => sum + (p.price * (p.volume || 0)), 0);
      const totalVolume = volumeData.reduce((sum, p) => sum + (p.volume || 0), 0);
      vwap = totalVolume > 0 ? totalValue / totalVolume : undefined;
    }

    // Calculate average change and change percent
    const changes = cleanPoints.filter(p => p.change !== undefined).map(p => p.change!);
    const changePcts = cleanPoints.filter(p => p.changePercent !== undefined).map(p => p.changePercent!);
    const avgChange = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : undefined;
    const avgChangePct = changePcts.length > 0 ? changePcts.reduce((a, b) => a + b, 0) / changePcts.length : undefined;

    // Aggregate bid/ask for spread
    const bids = points.filter(p => p.bid && p.bid > 0).map(p => p.bid!);
    const asks = points.filter(p => p.ask && p.ask > 0).map(p => p.ask!);
    const avgBid = bids.length > 0 ? bids.reduce((a, b) => a + b, 0) / bids.length : undefined;
    const avgAsk = asks.length > 0 ? asks.reduce((a, b) => a + b, 0) / asks.length : undefined;

    // Aggregate volume
    const totalVolume = points.reduce((sum, p) => sum + (p.volume || 0), 0);

    // Determine confidence based on source count and quality
    const uniqueSources = new Set(points.map(p => p.sourceId));
    const sourceCount = uniqueSources.size;
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (sourceCount >= 3) confidence = 'high';
    else if (sourceCount >= 2) confidence = 'medium';

    // Calculate price variance as a measure of agreement
    const priceVariance = this.calculateVariance(cleanPrices);
    if (sourceCount >= 2 && priceVariance > 0.05) {
      // High variance between sources reduces confidence
      if (confidence === 'high') confidence = 'medium';
      else if (confidence === 'medium') confidence = 'low';
    }

    // Calculate highest/lowest 24h across sources
    const highs = points.filter(p => p.high).map(p => p.high!);
    const lows = points.filter(p => p.low).map(p => p.low!);
    const high24h = highs.length > 0 ? Math.max(...highs) : undefined;
    const low24h = lows.length > 0 ? Math.min(...lows) : undefined;

    return {
      symbol,
      assetClass: assetClass || 'crypto',
      name: symbol,
      price: vwap || medianPrice,
      change: avgChange || 0,
      changePercent: avgChangePct || 0,
      high24h,
      low24h,
      volume24h: totalVolume,
      bid: avgBid,
      ask: avgAsk,
      spread: avgBid && avgAsk ? this.calculateSpread(avgBid, avgAsk) : undefined,
      timestamp: Date.now(),
      sources: Array.from(uniqueSources),
      sourceCount,
      confidence,
    };
  }

  /**
   * Detect and remove price outliers using IQR method
   */
  private filterOutliers(points: MarketDataPoint[]): MarketDataPoint[] {
    const prices = points.map(p => p.price).filter(p => p > 0);
    if (prices.length < 4) return points; // Need at least 4 for meaningful IQR
    
    const sorted = [...prices].sort((a, b) => a - b);
    const q1 = this.percentile(sorted, 25);
    const q3 = this.percentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return points.filter(p => p.price >= lowerBound && p.price <= upperBound);
  }

  /**
   * Combine multiple aggregated quotes into one (for same symbol from different groups)
   */
  mergeQuotes(quotes: AggregatedQuote[]): AggregatedQuote | null {
    if (quotes.length === 0) return null;
    if (quotes.length === 1) return quotes[0];

    const ref = quotes[0];
    const allSources = new Set<DataSource>();
    quotes.forEach(q => q.sources.forEach(s => allSources.add(s)));
    
    const prices = quotes.map(q => q.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = this.median(sortedPrices);

    return {
      ...ref,
      price: medianPrice,
      change: quotes.reduce((s, q) => s + q.change, 0) / quotes.length,
      changePercent: quotes.reduce((s, q) => s + q.changePercent, 0) / quotes.length,
      sourceCount: allSources.size,
      sources: Array.from(allSources),
      confidence: allSources.size >= 3 ? 'high' : allSources.size >= 2 ? 'medium' : 'low',
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate spread in basis points
   */
  private calculateSpread(bid: number, ask: number): number {
    if (bid <= 0 || ask <= 0) return 0;
    return ((ask - bid) / bid) * 10000; // In basis points
  }

  /**
   * Calculate variance of prices (normalized by median)
   */
  private calculateVariance(prices: number[]): number {
    if (prices.length < 2) return 0;
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    return variance / mean; // Normalized variance
  }

  private median(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private percentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}

export const aggregator = new Aggregator();