// Multi-Source Market Data - Unified Export
export { marketDataService } from './unified/MarketDataService';
export { sourceSelector } from './unified/SourceSelector';
export { aggregator } from './unified/Aggregator';

// Source adapters (for direct access if needed)
export { polygonSource } from './sources/polygon';
export { coinmarketcapSource } from './sources/coinmarketcap';
export { coindeskSource } from './sources/coindesk';
export { alphavantageSource } from './sources/alphavantage';
export { finnhubSource } from './sources/finnhub';
export { yahooSource } from './sources/yahoo';
export { coinapiSource } from './sources/coinapi';
export { marketauxSource } from './sources/marketaux';
export { twelvedataSource } from './sources/twelvedata';

// Types
export * from './types';