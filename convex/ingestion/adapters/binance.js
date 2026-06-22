export class BinanceAdapter {
    sourceId = "binance";
    name = "Binance";
    wsUrl = "wss://stream.binance.com:9443/ws"; // Or combined streams
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
            console.log("[Binance] WebSocket connection established");
            this.reconnectAttempts = 0;
            this.reconnectInterval = 1000;
            this.startHeartbeat();
            this.flushMessageQueue();
        };
        this.ws.onclose = (event) => {
            console.log("[Binance] WebSocket connection closed", event.code, event.reason);
            this.stopHeartbeat();
            this.attemptReconnect();
        };
        this.ws.onerror = (error) => {
            console.error("[Binance] WebSocket error", error);
        };
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            }
            catch (err) {
                console.error("[Binance] Error parsing message", err);
            }
        };
    }
    ;
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
        this.stopHeartbeat();
    }
    ;
    subscribe(symbols, channels) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("[Binance] WebSocket not ready, queuing subscription");
            return;
        }
        const payload = {
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
    ;
    onMessage(handler) {
        this.handlers.push(handler);
    }
    ;
    handleMessage(data) {
        const normalized = {
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
        }
        else if (data.e) {
            const event = data.e.toLowerCase();
            normalized.channel = this.mapBinanceEventToChannel(event);
            if (data.s) {
                normalized.instrumentId = this.normalizeSymbol(data.s);
            }
        }
        else if (data.topic) {
            const [symbol, channelInfo] = data.topic.split("/");
            normalized.instrumentId = this.normalizeSymbol(symbol);
            normalized.channel = this.normalizeChannel(channelInfo, "topic");
        }
        this.messageQueue.push(normalized);
        this.flushMessageQueue();
    }
    ;
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = this.messageQueue.shift();
            this.handlers.forEach((handler) => handler(msg));
        }
    }
    ;
    normalizeSymbol(symbol) {
        return symbol.replace(/USDT$/, "-USDT").replace(/USDC$/, "-USDC").replace(/BUSD$/, "-BUSD").replace(/TRY$/, "-TRY");
    }
    ;
    normalizeChannel(channelInfo, type) {
        if (type === "combined") {
            const parts = channelInfo.split("@");
            if (parts.length > 1) {
                const channelType = parts[1];
                return this.mapBinanceChannelToStandard(channelType);
            }
        }
        else if (type === "topic") {
            const parts = channelInfo.split("@");
            if (parts.length > 0) {
                return this.mapBinanceChannelToStandard(parts[0]);
            }
        }
        return "unknown";
    }
    ;
    mapBinanceEventToChannel(event) {
        const map = {
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
    ;
    mapBinanceChannelToStandard(channel) {
        const parts = channel.split("@")[0];
        const map = {
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
    ;
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ method: "ping", params: [], id: Date.now() }));
            }
        }, 20000);
    }
    ;
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
    ;
    attemptReconnect() {
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
    ;
}
