import { DataSource, MarketDataPoint, OrderBook, Trade, Candle, TimeInterval, NewsItem } from '../types';

const API_KEY = import.meta.env.VITE_COINAPI_API_KEY || '';
const REST_URL = 'https://rest.coinapi.io';
const WS_URL = 'wss://ws.coinapi.io/v1';

// Rate limiter: free tier = 100 req/day, paid plans vary.
// Use generous defaults but throttle responsibly.
class RateLimiter {
  private requestTimestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    // Prune old entries
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < this.windowMs);

    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldest = this.requestTimestamps[0];
      const waitMs = this.windowMs - (now - oldest) + 100;
      await new Promise(r => setTimeout(r, waitMs));
    }

    this.requestTimestamps.push(Date.now());
    return fn();
  }
}

const limiter = new RateLimiter(100, 60000); // 100 req/min ceiling

/**
 * CoinAPI REST v1 fetch wrapper.
 * https://docs.coinapi.io/#rest-v1
 */
async function coinApiFetch(path: string, retries = 2): Promise<any> {
  if (!API_KEY) {
    throw new Error('[CoinAPI] Missing API key. Set VITE_COINAPI_API_KEY in .env');
  }

  const url = `${REST_URL}${path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'X-CoinAPI-Key': API_KEY,
          'Accept': 'application/json',
        },
      });

      if (res.status === 429) {
        // Rate limited – wait progressively
        const wait = Math.pow(2, attempt + 1) * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`CoinAPI HTTP ${res.status}: ${text}`);
      }

      return res.json();
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('[CoinAPI] Request failed');
}

// ---- Helpers ----

function mapSymbol(symbol: string, assetClass?: string): string {
  // CoinAPI symbols use _ as separator, e.g. BITSTREAM_SPOT_BTC_USD
  // For simple symbols like "BTC/USD" -> "BTC_USD" or "BTCUSD"
  if (symbol.includes('/')) {
    return symbol.replace('/', '');
  }
  return symbol.replace(/[_/-]/g, '');
}

function determineAssetClass(symbol: string): 'crypto' | 'forex' | 'stock' {
  // CoinAPI mostly does crypto; forex pairs like EUR/USD
  const sym = symbol.toUpperCase().replace(/[/_-]/g, '');
  const cryptoIndicators = ['BTC', 'ETH', 'XRP', 'ADA', 'SOL', 'DOT', 'LTC', 'BNB', 'MATIC', 'AVAX'];
  if (cryptoIndicators.some(c => sym.startsWith(c) || sym.endsWith(c))) {
    return 'crypto';
  }
  if (['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'USD', 'HKD', 'SGD'].filter(c => sym.includes(c)).length >= 2) {
    return 'forex';
  }
  return 'crypto';
}

function parseTradeId(id: any): string {
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);
  // CoinAPI sometimes omits trade IDs - fallback to timestamp
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Source Adapter ----

export const coinapiSource = {
  sourceId: 'coinapi' as DataSource,

  // ── Exchange / Asset Info ──────────────────────────────

  /**
   * List all available exchanges from CoinAPI.
   */
  async getExchanges(): Promise<any[]> {
    return limiter.throttle(() => coinApiFetch('/v1/exchanges'));
  },

  /**
   * List all available assets (cryptocurrencies, fiat, etc.).
   */
  async getAssets(filterCrypto: boolean = false): Promise<any[]> {
    return limiter.throttle(async () => {
      const data: any[] = await coinApiFetch('/v1/assets');
      if (filterCrypto) {
        return data.filter(a => a.type_is_crypto === 1);
      }
      return data;
    });
  },

  /**
   * List all available symbol pairs (trading pairs).
   */
  async getSymbols(filterExchange?: string): Promise<any[]> {
    return limiter.throttle(async () => {
      let symbols: any[] = await coinApiFetch('/v1/symbols');
      if (filterExchange) {
        symbols = symbols.filter(s =>
          s.exchange_id?.toLowerCase() === filterExchange.toLowerCase()
        );
      }
      return symbols;
    });
  },

  // ── Current Price ──────────────────────────────────────

  /**
   * Get the current (latest) exchange rate for a symbol.
   * Symbol format: "BTC/USD" -> "BTCUSD" or "BITSTAMP_SPOT_BTC_USD"
   */
  async getExchangeRate(symbol: string, base?: string, quote?: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      // CoinAPI /v1/exchangerate endpoint
      const [from, to] = symbol.includes('/') ? symbol.split('/') : [symbol, base || 'USD'];
      const data = await coinApiFetch(`/v1/exchangerate/${from}/${to}`);

      if (!data || data.error) {
        throw new Error(`CoinAPI exchange rate error for ${from}/${to}: ${data?.error || 'Unknown'}`);
      }

      return {
        sourceId: 'coinapi',
        symbol: `${from}/${to}`,
        assetClass: determineAssetClass(`${from}/${to}`),
        timestamp: new Date(data.time || Date.now()).getTime(),
        price: data.rate,
        bid: data.ask || undefined,
        ask: data.bid || undefined,
        change: undefined,
        changePercent: undefined,
        volume: data.volume_24h ? parseFloat(data.volume_24h) : undefined,
      };
    });
  },

  /**
   * Get current quote for a specific symbol pair from a specific exchange.
   * symbol e.g. "BITSTAMP_SPOT_BTC_USD"
   */
  async getCurrentQuote(symbol: string): Promise<MarketDataPoint> {
    return limiter.throttle(async () => {
      const data = await coinApiFetch(`/v1/quotes/${symbol}/current`);

      if (!data || data.error) {
        throw new Error(`CoinAPI quote error for ${symbol}: ${data?.error || 'No data'}`);
      }

      return {
        sourceId: 'coinapi',
        symbol,
        assetClass: determineAssetClass(symbol),
        timestamp: new Date(data.time_exchange || data.time_coinapi || Date.now()).getTime(),
        price: data.ask_price || data.last_price || data.bid_price || 0,
        bid: data.bid_price,
        ask: data.ask_price,
        spread: data.ask_price && data.bid_price
          ? ((data.ask_price - data.bid_price) / data.bid_price) * 10000
          : undefined,
        volume: data.volume_24h ? parseFloat(data.volume_24h) : undefined,
      };
    });
  },

  // ── OHLCV / Historical Data ────────────────────────────

  /**
   * Get OHLCV (candles) for a symbol.
   * symbol_id: e.g. "BITSTAMP_SPOT_BTC_USD"
   * period_id: e.g. "1MIN", "5MIN", "1HRS", "1DAY"
   * time_start: ISO 8601 timestamp
   * limit: max records (max 100000)
   */
  async getOhlcv(
    symbolId: string,
    periodId: string = '1DAY',
    timeStart?: string,
    limit: number = 100,
  ): Promise<Candle[]> {
    return limiter.throttle(async () => {
      const params = new URLSearchParams({
        period_id: periodId,
        limit: String(limit),
      });
      if (timeStart) params.set('time_start', timeStart);

      const data = await coinApiFetch(`/v1/ohlcv/${symbolId}/history?${params}`);

      if (!Array.isArray(data)) {
        throw new Error(`CoinAPI OHLCV error for ${symbolId}: No data`);
      }

      return data.map((c: any) => ({
        symbol: symbolId,
        sourceId: 'coinapi' as DataSource,
        interval: mapPeriodToInterval(periodId),
        open: c.price_open,
        high: c.price_high,
        low: c.price_low,
        close: c.price_close,
        volume: c.volume_traded || 0,
        timestamp: new Date(c.time_period_start || c.time_period_end).getTime(),
        vwap: undefined,
        trades: c.trades_count,
      }));
    });
  },

  /**
   * Get latest OHLCV candle(s).
   */
  async getLatestOhlcv(symbolId: string, periodId: string = '1DAY'): Promise<Candle[]> {
    return limiter.throttle(async () => {
      const data = await coinApiFetch(`/v1/ohlcv/${symbolId}/latest?period_id=${periodId}`);

      if (!Array.isArray(data)) {
        throw new Error(`CoinAPI latest OHLCV error for ${symbolId}`);
      }

      return data.map((c: any) => ({
        symbol: symbolId,
        sourceId: 'coinapi' as DataSource,
        interval: mapPeriodToInterval(periodId),
        open: c.price_open,
        high: c.price_high,
        low: c.price_low,
        close: c.price_close,
        volume: c.volume_traded || 0,
        timestamp: new Date(c.time_period_start || c.time_period_end).getTime(),
      }));
    });
  },

  // ── Trades ──────────────────────────────────────────────

  /**
   * Get recent trades for a symbol.
   */
  async getTrades(symbolId: string, limit: number = 100): Promise<Trade[]> {
    return limiter.throttle(async () => {
      const data = await coinApiFetch(`/v1/trades/${symbolId}/history?limit=${limit}`);

      if (!Array.isArray(data)) {
        throw new Error(`CoinAPI trades error for ${symbolId}`);
      }

      return data.map((t: any) => ({
        id: parseTradeId(t.uuid || t.trade_id),
        symbol: symbolId,
        sourceId: 'coinapi' as DataSource,
        price: t.price,
        size: t.size || t.amount || 0,
        side: t.taker_side === 'BUY' ? 'buy' as const : t.taker_side === 'SELL' ? 'sell' as const : 'unknown' as const,
        timestamp: new Date(t.time_exchange || t.time_coinapi).getTime(),
        exchange: t.exchange_id,
      }));
    });
  },

  /**
   * Get latest trades.
   */
  async getLatestTrades(symbolId: string): Promise<Trade[]> {
    return limiter.throttle(async () => {
      const data = await coinApiFetch(`/v1/trades/${symbolId}/latest`);

      if (!Array.isArray(data)) {
        throw new Error(`CoinAPI latest trades error for ${symbolId}`);
      }

      return data.map((t: any) => ({
        id: parseTradeId(t.uuid || t.trade_id),
        symbol: symbolId,
        sourceId: 'coinapi' as DataSource,
        price: t.price,
        size: t.size || t.amount || 0,
        side: t.taker_side === 'BUY' ? 'buy' as const : t.taker_side === 'SELL' ? 'sell' as const : 'unknown' as const,
        timestamp: new Date(t.time_exchange || t.time_coinapi).getTime(),
        exchange: t.exchange_id,
      }));
    });
  },

  // ── Order Book ──────────────────────────────────────────

  /**
   * Get current order book for a symbol.
   * depth: limit levels per side (max 5000)
   */
  async getOrderBook(symbolId: string, depth: number = 50): Promise<OrderBook> {
    return limiter.throttle(async () => {
      const data = await coinApiFetch(`/v1/orderbooks/${symbolId}/current?limit_levels=${depth}`);

      if (!data || !Array.isArray(data.asks) || !Array.isArray(data.bids)) {
        throw new Error(`CoinAPI order book error for ${symbolId}`);
      }

      const orderBookData: OrderBook = {
        symbol: symbolId,
        sourceId: 'coinapi',
        bids: (data.bids || []).slice(0, depth).map((b: any) => ({
          price: b.price || b.level,
          size: b.size || b.amount || 0,
          orderCount: b.order_count,
        })),
        asks: (data.asks || []).slice(0, depth).map((a: any) => ({
          price: a.price || a.level,
          size: a.size || a.amount || 0,
          orderCount: a.order_count,
        })),
        timestamp: new Date(data.time_exchange || data.time_coinapi || Date.now()).getTime(),
        isSnapshot: true,
      };

      return orderBookData;
    });
  },

  // ── News (via CoinAPI CryptoPanic / integrated) ──────────

  /**
   * CoinAPI does not have a native news endpoint, but we can fetch
   * metadata and aggregate from the available data.
   * For a full news feed, consider coindesk or finnhub.
   */
  async getNews(limit: number = 20): Promise<NewsItem[]> {
    // CoinAPI doesn't provide native news; return empty array.
    // Users should use finnhub/coindesk for news.
    console.warn('[CoinAPI] News not supported. Use Finnhub or CoinDesk for market news.');
    return [];
  },

  // ── WebSocket Support ──────────────────────────────────

  /**
   * Create a WebSocket connection for real-time data.
   * CoinAPI WebSocket protocol:
   * Subscribe: { "type": "hello", "apikey": "...", "subscribe_data": [...] }
   * Data types: trades, quotes, ohlcv, book5, book20, book50, book100
   */
  createWebSocket(subscriptions?: { type: string; symbol_id: string }[]): WebSocket | null {
    if (!API_KEY) {
      console.warn('[CoinAPI] No API key configured for WebSocket');
      return null;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      // Send hello message
      const helloMsg: any = {
        type: 'hello',
        apikey: API_KEY,
        heartbeat: false,
        subscribe_data: subscriptions || [],
      };
      ws.send(JSON.stringify(helloMsg));
    };

    return ws;
  },

  /**
   * Subscribe to real-time trades via WebSocket.
   */
  subscribeTrades(ws: WebSocket, symbolIds: string[]): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        subscribe_data: symbolIds.map(sid => ({
          type: 'trade',
          symbol_id: sid,
        })),
      }));
    }
  },

  /**
   * Subscribe to real-time quotes via WebSocket.
   */
  subscribeQuotes(ws: WebSocket, symbolIds: string[]): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        subscribe_data: symbolIds.map(sid => ({
          type: 'quote',
          symbol_id: sid,
        })),
      }));
    }
  },

  /**
   * Subscribe to real-time order book (level-2) via WebSocket.
   */
  subscribeOrderBook(ws: WebSocket, symbolIds: string[], depth: number = 50): void {
    const bookType = `book${depth}` as const;
    const validDepths = [5, 10, 20, 50, 100] as const;
    const actualType = validDepths.includes(depth as typeof validDepths[number])
      ? (`book${depth}` as string)
      : 'book50';

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        subscribe_data: symbolIds.map(sid => ({
          type: actualType,
          symbol_id: sid,
        })),
      }));
    }
  },

  /**
   * Unsubscribe from channels.
   */
  unsubscribe(ws: WebSocket, symbolIds: string[], dataTypes: string[] = ['trade']): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscribe_data: symbolIds.flatMap(sid =>
          dataTypes.map(dt => ({ type: dt, symbol_id: sid }))
        ),
      }));
    }
  },
};

// ── Utility ──────────────────────────────────────────────

function mapPeriodToInterval(periodId: string): TimeInterval {
  const map: Record<string, TimeInterval> = {
    '1MIN': '1m',
    '5MIN': '5m',
    '15MIN': '15m',
    '30MIN': '30m',
    '1HRS': '1h',
    '4HRS': '4h',
    '1DAY': '1d',
    '1WEE': '1w',
    '1MTH': '1M',
  };
  return map[periodId.toUpperCase()] || '1d';
}