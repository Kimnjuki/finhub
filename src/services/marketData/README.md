# Multi-Source Market Data Service Architecture

## Platforms Researched & Features Integrated

### 1. Coinbase Exchange
- **Best for**: Real-time crypto market data
- **Features added**: Proper WebSocket auth, multi-product subscriptions, heartbeat management, order book snapshots

### 2. Kraken
- **Best for**: Spot market data, ticker, order book streams
- **Features added**: Symbol normalization, OHLCV streaming, depth management, ping/pong keepalive

### 3. Polygon.io
- **Best for**: Stocks, crypto, forex, options
- **Features added**: Multi-asset terminal, aggregated bars, trades, quotes, reference data

### 4. CoinMarketCap
- **Best for**: Broad crypto market coverage
- **Features added**: Rankings, metadata, cross-exchange aggregation, global metrics, trending coins, gainers/losers

### 5. CoinDesk Data
- **Best for**: Institutional crypto data
- **Features added**: Normalized multi-exchange data, index prices, institutional-grade reference rates

### 6. Alpha Vantage
- **Best for**: Fast prototyping for finance
- **Features added**: Simple market data access, technical indicators, forex, crypto, sector performance

### 7. Finnhub
- **Best for**: Real-time market + alternative data
- **Features added**: News sentiment, fundamentals, earnings, IPO calendar, insider transactions, social sentiment

### 8. Yahoo Finance / FT Markets
- **Best for**: Broad finance reference
- **Features added**: Watchlists, quotes, market pages, sector performance, key statistics, historical data

## Architecture

```
src/services/marketData/
├── README.md
├── index.ts                    # Unified exports & source routing
├── types.ts                    # Shared types for all sources
├── sources/
│   ├── coinbase.ts             # Enhanced Coinbase adapter
│   ├── kraken.ts               # Enhanced Kraken adapter  
│   ├── polygon.ts              # Polygon.io multi-asset terminal
│   ├── coinmarketcap.ts        # CoinMarketCap rankings & aggregation
│   ├── coindesk.ts             # CoinDesk institutional data
│   ├── alphavantage.ts         # Alpha Vantage fast prototyping
│   ├── finnhub.ts              # Enhanced Finnhub news + fundamentals
│   └── yahoo.ts               # Yahoo Finance reference data
├── unified/
│   ├── MarketDataService.ts    # Orchestrates all sources
│   ├── SourceSelector.ts       # Auto-selects best source per asset
│   └── Aggregator.ts           # Cross-source price aggregation
└── hooks/
    ├── useMultiSourcePrice.ts  # React hook for unified pricing
    ├── useMarketNews.ts        # Aggregated news from all sources
    └── useFundamentals.ts      # Fundamental data from all sources