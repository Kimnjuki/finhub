export class KrakenAdapter {
    sourceId = "kraken";
    name = "Kraken";
    wsUrl = "wss://ws.kraken.com";
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
            console.log("[Kraken] WebSocket connection established");
            this.reconnectAttempts = 0;
            this.reconnectInterval = 1000;
            this.startHeartbeat();
            this.flushMessageQueue();
        };
        this.ws.onclose = (event) => {
            console.log("[Kraken] WebSocket connection closed", event.code, event.reason);
            this.stopHeartbeat();
            this.attemptReconnect();
        };
        this.ws.onerror = (error) => {
            console.error("[Kraken] WebSocket error", error);
        };
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            }
            catch (err) {
                console.error("[Kraken] Error parsing message", err);
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
            console.warn("[Kraken] WebSocket not ready, queuing subscription");
            return;
        }
        const subscriptions = [];
        for (const symbol of symbols) {
            const krakenSymbol = symbol.replace("-", "-").toUpperCase(); // e.g., BTC-USD
            for (const channel of channels) {
                let channelName = "";
                switch (channel) {
                    case "trades":
                        channelName = "trade";
                        subscriptions.push({
                            event: "subscribe",
                            pair: krakenSymbol,
                            subscription: { name: "trade" },
                        });
                        break;
                    case "orderbook_l2":
                        channelName = "orderbook";
                        subscriptions.push({
                            event: "subscribe",
                            pair: krakenSymbol,
                            subscription: { name: "book", depth: 25 },
                        });
                        break;
                    case "ticker":
                        channelName = "ticker";
                        subscriptions.push({
                            event: "subscribe",
                            pair: krakenSymbol,
                            subscription: { name: "ticker" },
                        });
                        break;
                    case "ohlcv":
                        // Kraken provides OHLC via own channel, not kline
                        channelName = "ohlc";
                        subscriptions.push({
                            event: "subscribe",
                            pair: krakenSymbol,
                            subscription: { name: "ohlc", interval: 1440 },
                        });
                        break;
                    case "funding":
                        // Kraken doesn't have funding rates via WebSocket
                        console.warn(`[Kraken] Funding rates not available via WebSocket for ${krakenSymbol}`);
                        continue;
                    case "open_interest":
                        // Not available via WebSocket
                        console.warn(`[Kraken] Open interest not available via WebSocket for ${krakenSymbol}`);
                        continue;
                    case "liquidations":
                        // Not available via WebSocket
                        console.warn(`[Kraken] Liquidations not available via WebSocket for ${krakenSymbol}`);
                        continue;
                    default:
                        console.warn(`[Kraken] Unknown channel: ${channel} for ${krakenSymbol}`);
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
            // Initial subscription response or batch updates
            data.forEach((msg) => {
                if (msg.params) {
                    const [channel, pair] = msg.channel.split(".");
                    normalized.instrumentId = this.normalizeSymbol(pair);
                    normalized.channel = this.mapKrakenChannelToStandard(channel);
                    this.messageQueue.push({ ...normalized });
                }
                else if (msg.a) {
                    // Trade update
                    normalized.channel = "trades";
                    normalized.instrumentId = this.normalizeSymbol(msg.c);
                    this.messageQueue.push({ ...normalized });
                }
                else if (msg.b) {
                    // Order book update
                    normalized.channel = "orderbook_l2";
                    normalized.instrumentId = this.normalizeSymbol(msg.c);
                    this.messageQueue.push({ ...normalized });
                }
                else if (msg.c) {
                    // Ticker update
                    normalized.channel = "ticker";
                    normalized.instrumentId = this.normalizeSymbol(msg.c);
                    this.messageQueue.push({ ...normalized });
                }
                else if (msg.d) {
                    // OHLC update
                    normalized.channel = "ohlcv";
                    normalized.instrumentId = this.normalizeSymbol(msg.c);
                    this.messageQueue.push({ ...normalized });
                }
            });
        }
        else {
            // Single message
            if (data.params) {
                const [channel, pair] = data.params.channel.split(".");
                normalized.instrumentId = this.normalizeSymbol(pair);
                normalized.channel = this.mapKrakenChannelToStandard(channel);
                this.messageQueue.push(normalized);
            }
            else if (data.a) {
                normalized.channel = "trades";
                normalized.instrumentId = this.normalizeSymbol(data.c);
                this.messageQueue.push(normalized);
            }
            else if (data.b) {
                normalized.channel = "orderbook_l2";
                normalized.instrumentId = this.normalizeSymbol(data.c);
                this.messageQueue.push(normalized);
            }
            else if (data.c) {
                normalized.channel = "ticker";
                normalized.instrumentId = this.normalizeSymbol(data.c);
                this.messageQueue.push(normalized);
            }
            else if (data.d) {
                normalized.channel = "ohlcv";
                normalized.instrumentId = this.normalizeSymbol(data.c);
                this.messageQueue.push(normalized);
            }
            else if (data.event === "heartbeat") {
                // Ignore heartbeat
                return;
            }
            else {
                normalized.channel = "unknown";
                this.messageQueue.push(normalized);
            }
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
        // Kraken uses symbols like XBT/USD, BTC-USD, etc. We need canonical format
        return symbol.replace(/-/, "-").toUpperCase(); // Keep as is for now
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                // Kraken doesn't have ping/pong, but we can send a ping if needed
                console.debug(`[Kraken] Heartbeat for ${this.sourceId}`);
            }
        }, 30000);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
    mapKrakenChannelToStandard(channel) {
        const map = {
            "trade": "trades",
            "book": "orderbook_l2",
            "ticker": "ticker",
            "ohlc": "ohlcv",
        };
        return map[channel] || "unknown";
    }
    attemptReconnect() {
        if (this.reconnectAttempts >= 10) {
            console.error("[Kraken] Max reconnect attempts reached");
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, this.maxReconnectInterval);
        console.log(`[Kraken] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.connect();
        }, delay);
    }
}
