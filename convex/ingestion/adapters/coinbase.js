import { ingestTick, ingestOrderBook } from "../bootstrap";
import client from "../../../src/integrations/convex/client";
export class CoinbaseAdapter {
    sourceId = "coinbase";
    name = "Coinbase";
    wsUrl = "wss://ws-feed.pro.coinbase.com";
    handlers = [];
    ws;
    reconnectInterval = 1000;
    maxReconnectInterval = 60000;
    reconnectAttempts = 0;
    heartbeatInterval;
    messageQueue = [];
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
        this.ws.onclose = (event) => {
            console.log("[Coinbase] WebSocket connection closed", event.code, event.reason);
            this.stopHeartbeat();
            this.attemptReconnect();
        };
        this.ws.onerror = (error) => {
            console.error("[Coinbase] WebSocket error", error);
        };
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            }
            catch (err) {
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
    subscribe(symbols, channels) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("[Coinbase] WebSocket not ready, queuing subscription");
            return;
        }
        const subscriptions = [];
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
    onMessage(handler) {
        this.handlers.push(handler);
    }
    handleMessage(data) {
        const normalized = {
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
                }
                else if (msg.type === "level2") {
                    normalized.channel = "orderbook_l2";
                    normalized.instrumentId = this.normalizeSymbol(msg.product_id);
                }
                else if (msg.type === "ticker") {
                    normalized.channel = "ticker";
                    normalized.instrumentId = this.normalizeSymbol(msg.product_id);
                }
                // Queue the message for processing
                this.messageQueue.push({ ...normalized });
            });
        }
        else {
            // Single message
            if (data.type === "match") {
                normalized.channel = "trades";
                normalized.instrumentId = this.normalizeSymbol(data.product_id);
            }
            else if (data.type === "level2") {
                normalized.channel = "orderbook_l2";
                normalized.instrumentId = this.normalizeSymbol(data.product_id);
            }
            else if (data.type === "ticker") {
                normalized.channel = "ticker";
                normalized.instrumentId = this.normalizeSymbol(data.product_id);
            }
            else if (data.type === "subscriptions") {
                // Acknowledgement, ignore
                return;
            }
            else {
                normalized.channel = "unknown";
            }
            this.messageQueue.push(normalized);
        }
        this.flushMessageQueue();
    }
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = this.messageQueue.shift();
            this.handlers.forEach((handler) => handler(msg));
        }
    }
    normalizeSymbol(symbol) {
        // Coinbase uses symbols like BTC-USD, we need to convert to canonical format
        return symbol.replace(/-/, "-").toUpperCase(); // Keep as is for now
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                // Coinbase doesn't have ping/pong, but we can log occasionally
                console.debug(`[Coinbase] Heartbeat for ${this.sourceId}`);
            }
        }, 30000);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
    attemptReconnect() {
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
    async ingestData(msg) {
        try {
            switch (msg.channel) {
                case "trades":
                    await ingestTick(client, {
                        instrumentId: msg.instrumentId,
                        sourceId: this.sourceId,
                        price: msg.payload.price,
                        size: msg.payload.size,
                        side: msg.payload.side,
                        tradeId: msg.payload.trade_id,
                        tsUtc: msg.tsUtc,
                        receivedAt: msg.receivedAt,
                    });
                    break;
                case "orderbook_l2":
                    const changes = msg.payload.changes;
                    await ingestOrderBook(client, {
                        instrumentId: msg.instrumentId,
                        sourceId: this.sourceId,
                        level: "l2",
                        bids: changes.filter((c) => c[0] >= 0).map((c) => ({ price: c[0], size: c[1] })),
                        asks: changes.filter((c) => c[0] < 0).map((c) => ({ price: Math.abs(c[0]), size: c[1] })),
                        sequence: msg.payload.sequence,
                        tsUtc: msg.tsUtc,
                        receivedAt: msg.receivedAt,
                    });
                    break;
                case "ticker":
                    // Handle ticker updates (could update price)
                    break;
            }
        }
        catch (err) {
            console.error(`[Coinbase] Error ingesting data for ${msg.instrumentId} channel ${msg.channel}:`, err);
        }
    }
}
