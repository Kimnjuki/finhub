import { ExchangeAdapter, NormalizedMessage, NormalizedTrade } from "../types";
import { ingestTick, ingestOhlcv, ingestOrderBook, ingestStreamMessage } from "../ingestion/bootstrap";

export class BinanceAdapter implements ExchangeAdapter {
  sourceId = "binance" as const;
  name = "Binance";
  wsUrl = "wss://stream.binance.com:9443/ws"; // Or combined streams

  private handlers: ((msg: NormalizedMessage) => void)[] = [];
  private ws?: any;
  private reconnectInterval = 1000;
  private maxReconnectInterval = 60000;
  private reconnectAttempts = 0;
  private heartbeatInterval?: any;
  private messageQueue: NormalizedMessage[] = [];

  async connect() {
    // @ts-ignore: WebSocket is available globally when ws package is installed
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log("[Binance] WebSocket connection established");
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000;
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.ws.onclose = (event: any) => {
      console.log("[Binance] WebSocket connection closed", event.code, event.reason);
      this.stopHeartbeat();
      this.attemptReconnect();
    };

    this.ws.onerror = (error: any) => {
      console.error("[Binance] WebSocket error", error);
    };

    this.ws.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error("[Binance] Error parsing message", err);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.stopHeartbeat();
  }

  subscribe(symbols: string[], channels: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[Binance] WebSocket not ready, queuing subscription");
      return;
    }

    const payload: any = {
      method: "SUBSCRIBE",
      params: [],
      id: Date.now(),
    };

    for (const symbol of symbols) {
      const binanceSymbol = symbol.replace("-", "").toLowerCase();
      for (const channel of channels) {
        let channelName = "";
        switch (channel) {
          case "trades":
            channelName = `${binanceSymbol}@aggTrade`;
            break;
          case "orderbook_l2":
            channelName = `${binanceSymbol}@depth20@100ms`;
            break;
          case "ticker":
            channelName = `${binanceSymbol}@ticker`;
            break;
          case "ohlcv":
            channelName = `${binanceSymbol}@kline_1m`;
            break;
          case "funding":
            channelName = `${binanceSymbol}@markPrice@1000ms`;
            break;
          case "open_interest":
            channelName = `${binanceSymbol}@openInterest@1000ms`;
            break;
          case "liquidations":
            channelName = `${binanceSymbol}!forceOrder@arr`;
            break;
          default:
            console.warn(`[Binance] Unknown channel: ${channel}`);
            continue;
        }
        payload.params.push(channelName);
      }
    }

    this.ws.send(JSON.stringify(payload));
  }

  onMessage(handler: (msg: NormalizedMessage) => void) {
    this.handlers.push(handler);
  }

  private handleMessage(data: any) {
    const normalized: NormalizedMessage = {
      sourceId: this.sourceId,
      instrumentId: "",
      channel: "",
      tsUtc: Date.now(),
      receivedAt: Date.now(),
      payload: data,
    };

    if (data.stream) {
      const [symbol, channelInfo] = data.stream.split("@");
      normalized.instrumentId = this.normalizeSymbol(symbol);
      normalized.channel = this.normalizeChannel(channelInfo, "combined");
    } else if (data.e) {
      const event = data.e.toLowerCase();
      normalized.channel = this.mapBinanceEventToChannel(event);
      if (data.s) {
        normalized.instrumentId = this.normalizeSymbol(data.s);
      }
    } else if (data.topic) {
      const [symbol, channelInfo] = data.topic.split("/");
      normalized.instrumentId = this.normalizeSymbol(symbol);
      normalized.channel = this.normalizeChannel(channelInfo, "topic");
    }

    this.messageQueue.push(normalized);
    this.flushMessageQueue();
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift()!;
      this.handlers.forEach((handler) => handler(msg));
    }
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.replace(/USDT$/, "-USDT").replace(/USDC$/, "-USDC").replace(/BUSD$/, "-BUSD").replace(/TRY$/, "-TRY");
  }

  private normalizeChannel(channelInfo: string, type: string): string {
    if (type === "combined") {
      const parts = channelInfo.split("@");
      if (parts.length > 1) {
        const channelType = parts[1];
        return this.mapBinanceChannelToStandard(channelType);
      }
    } else if (type === "topic") {
      const parts = channelInfo.split("@");
      if (parts.length > 0) {
        return this.mapBinanceChannelToStandard(parts[0]);
      }
    }
    return "unknown";
  }

  private mapBinanceEventToChannel(event: string): string {
    const map: Record<string, string> = {
      "aggtrade": "trades",
      "trade": "trades",
      "depthupdate": "orderbook_l2",
      "ticker": "ticker",
      "kline": "ohlcv",
      "markpriceupdate": "funding",
      "openinterestupdate": "open_interest",
    };
    return map[event] || "unknown";
  }

  private mapBinanceChannelToStandard(channel: string): string {
    const parts = channel.split("@")[0];
    const map: Record<string, string> = {
      "aggtrade": "trades",
      "depth": "orderbook_l2",
      "ticker": "ticker",
      "kline": "ohlcv",
      "markprice": "funding",
      "openinterest": "open_interest",
      "forceorder": "liquidations",
    };
    const baseChannel = parts.replace(/[0-9@].*/, "");
    return map[baseChannel] || "unknown";
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping", params: [], id: Date.now() }));
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= 10) {
      console.error("[Binance] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, this.maxReconnectInterval);
    console.log(`[Binance] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Add handler for ingesting data into Convex
  async ingestData(msg: NormalizedMessage) {
    try {
      // Call appropriate Convex mutation based on channel
      switch (msg.channel) {
        case "trades":
          await ingestTick(client, {
            instrumentId: msg.instrumentId,
            sourceId: this.sourceId,
            price: msg.payload.p || msg.payload.price || 0,
            size: msg.payload.q || msg.payload.size || 0,
            side: msg.payload.m || false ? 'sell' : 'buy', // m indicates maker order
            tradeId: msg.payload.e === 'aggTrade' ? msg.payload.a : undefined,
            isMakerOrder: msg.payload.m,
            tsUtc: msg.tsUtc,
            receivedAt: msg.receivedAt,
          });
          break;
        case "ohlcv":
          await ingestOhlcv(client, {
            instrumentId: msg.instrumentId,
            sourceId: this.sourceId,
            interval: "1m", // kline_1m
            open: msg.payload.o,
            high: msg.payload.h,
            low: msg.payload.l,
            close: msg.payload.c,
            volume: msg.payload.v,
            quoteVolume: msg.payload.q,
            tradeCount: msg.payload.n,
            tsUtc: msg.tsUtc,
            isClosed: true,
          });
          break;
        case "orderbook_l2":
          // Handle order book updates
          await ingestOrderBook(client, {
            instrumentId: msg.instrumentId,
            sourceId: this.sourceId,
            level: "l2",
            bids: msg.payload.b || msg.payload.bids || [],
            asks: msg.payload.a || msg.payload.asks || [],
            sequence: msg.payload.u,
            tsUtc: msg.tsUtc,
            receivedAt: msg.receivedAt,
          });
          break;
        case "ticker":
          // Handle ticker updates (could be used for price)
          break;
        case "funding":
          // Handle funding rate updates
          break;
        case "open_interest":
          // Handle open interest updates
          break;
        case "liquidations":
          // Handle liquidation updates
          break;
      }
    } catch (err) {
      console.error(`[Binance] Error ingesting data for ${msg.instrumentId} channel ${msg.channel}:`, err);
    }
  }
}
+++++++ REPLACE
</diff>
<task_progress>
- [x] Set up project structure
- [x] Install dependencies
- [x] Create WebSocketProvider (removed)
- [x] Complete MarketDataProvider (removed)
- [x] Add missing Convex queries
- [x] Implement InstrumentTicker
- [x] Implement OrderBookDepth
- [x] Implement CandlestickChart
- [x] Implement AlertManager
- [x] Implement SignalFeed
- [ ] Implement EventCalendar
- [ ] Implement WatchlistPanel
- [ ] Implement StreamHealthMonitor
- [x] Integrate ingestion adapters with Convex mutations
- [ ] Implement stream health monitoring cron
- [ ] Implement instrument registry bootstrap
- [ ] Add Redis backpressure buffer
- [ ] Implement failover with leader election
- [ ] Test all components
- [ ] Commit changes to GitHub
</task_progress>
</replace_in_file>