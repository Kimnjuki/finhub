import { ExchangeAdapter, NormalizedMessage, NormalizedTrade } from "../types";
import { ingestTick, ingestOhlcv, ingestOrderBook, ingestStreamMessage } from "../ingestion/bootstrap";
import client from "../../../src/integrations/convex/client";

export class CoinbaseAdapter implements ExchangeAdapter {
  sourceId = "coinbase" as const;
  name = "Coinbase";
  wsUrl = "wss://ws-feed.pro.coinbase.com";

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
      console.log("[Coinbase] WebSocket connection established");
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000;
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.ws.onclose = (event: any) => {
      console.log("[Coinbase] WebSocket connection closed", event.code, event.reason);
      this.stopHeartbeat();
      this.attemptReconnect();
    };

    this.ws.onerror = (error: any) => {
      console.error("[Coinbase] WebSocket error", error);
    };

    this.ws.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error("[Coinbase] Error parsing message", err);
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
      console.warn("[Coinbase] WebSocket not ready, queuing subscription");
      return;
    }

    const subscriptions: any[] = [];

    for (const symbol of symbols) {
      const coinbaseSymbol = symbol.replace("-", "-").toUpperCase(); // e.g., BTC-USD
      for (const channel of channels) {
        let channelName = "";
        switch (channel) {
          case "trades":
            channelName = "matches";
            subscriptions.push({ type: "matches", product_ids: [coinbaseSymbol] });
            break;
          case "orderbook_l2":
            channelName = "level2";
            subscriptions.push({ type: "level2", product_ids: [coinbaseSymbol] });
            break;
          case "ticker":
            channelName = "ticker";
            subscriptions.push({ type: "ticker", product_ids: [coinbaseSymbol] });
            break;
          case "ohlcv":
            // Coinbase doesn't provide OHLCV directly via WebSocket, need to use candles endpoint
            console.warn(`[Coinbase] OHLCV not available via WebSocket for ${coinbaseSymbol}`);
            continue;
          case "funding":
            // Coinbase doesn't have funding rates via WebSocket
            console.warn(`[Coinbase] Funding rates not available via WebSocket for ${coinbaseSymbol}`);
            continue;
          case "open_interest":
            // Not available via WebSocket
            console.warn(`[Coinbase] Open interest not available via WebSocket for ${coinbaseSymbol}`);
            continue;
          case "liquidations":
            // Not available via WebSocket
            console.warn(`[Coinbase] Liquidations not available via WebSocket for ${coinbaseSymbol}`);
            continue;
          default:
            console.warn(`[Coinbase] Unknown channel: ${channel} for ${coinbaseSymbol}`);
            continue;
        }
      }
    }

    if (subscriptions.length > 0) {
      this.ws.send(JSON.stringify(subscriptions));
    }
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

    if (Array.isArray(data)) {
      // Batch updates or initial snapshot
      data.forEach((msg) => {
        if (msg.type === "match") {
          normalized.channel = "trades";
          normalized.instrumentId = this.normalizeSymbol(msg.product_id);
        } else if (msg.type === "level2") {
          normalized.channel = "orderbook_l2";
          normalized.instrumentId = this.normalizeSymbol(msg.product_id);
        } else if (msg.type === "ticker") {
          normalized.channel = "ticker";
          normalized.instrumentId = this.normalizeSymbol(msg.product_id);
        }
        // Queue the message for processing
        this.messageQueue.push({ ...normalized });
      });
    } else {
      // Single message
      if (data.type === "match") {
        normalized.channel = "trades";
        normalized.instrumentId = this.normalizeSymbol(data.product_id);
      } else if (data.type === "level2") {
        normalized.channel = "orderbook_l2";
        normalized.instrumentId = this.normalizeSymbol(data.product_id);
      } else if (data.type === "ticker") {
        normalized.channel = "ticker";
        normalized.instrumentId = this.normalizeSymbol(data.product_id);
      } else if (data.type === "subscriptions") {
        // Acknowledgement, ignore
        return;
      } else {
        normalized.channel = "unknown";
      }
      this.messageQueue.push(normalized);
    }

    this.flushMessageQueue();
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift()!;
      this.handlers.forEach((handler) => handler(msg));
    }
  }

  private normalizeSymbol(symbol: string): string {
    // Coinbase uses symbols like BTC-USD, we need to convert to canonical format
    return symbol.replace(/-/, "-").toUpperCase(); // Keep as is for now
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Coinbase doesn't have ping/pong, but we can log occasionally
        console.debug(`[Coinbase] Heartbeat for ${this.sourceId}`);
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= 10) {
      console.error("[Coinbase] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, this.maxReconnectInterval);
    console.log(`[Coinbase] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Add handler for ingesting data into Convex
  async ingestData(msg: NormalizedMessage) {
    try {
      switch (msg.channel) {
        case "trades":
await ingestTick(client, {
            instrumentId: msg.instrumentId,
            sourceId: this.sourceId,
            price: msg.payload.price as number,
            size: msg.payload.size as number,
            side: msg.payload.side as 'buy' | 'sell' | 'unknown',
            tradeId: msg.payload.trade_id as string,
            tsUtc: msg.tsUtc,
            receivedAt: msg.receivedAt,
          });
          break;
case "orderbook_l2":
          const changes = msg.payload.changes as any[];
          await ingestOrderBook(client, {
            instrumentId: msg.instrumentId,
            sourceId: this.sourceId,
            level: "l2",
            bids: changes.filter((c: any) => c[0] >= 0).map((c: any) => ({ price: c[0], size: c[1] })),
            asks: changes.filter((c: any) => c[0] < 0).map((c: any) => ({ price: Math.abs(c[0]), size: c[1] })),
            sequence: msg.payload.sequence as number,
            tsUtc: msg.tsUtc,
            receivedAt: msg.receivedAt,
          });
          break;
        case "ticker":
          // Handle ticker updates (could update price)
          break;
      }
    } catch (err) {
      console.error(`[Coinbase] Error ingesting data for ${msg.instrumentId} channel ${msg.channel}:`, err);
    }
  }
}