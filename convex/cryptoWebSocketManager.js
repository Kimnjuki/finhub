// crypto-websocket-manager.ts
// Low-latency WebSocket manager for crypto exchange data feeds
const WebSocket_CONNECTING = 0;
const WebSocket_OPEN = 1;
const WebSocket_CLOSING = 2;
const WebSocket_CLOSED = 3;
export class CryptoWebSocketManager {
    ws = null;
    config;
    heartbeatInterval = null;
    reconnectTimeout = null;
    sequence = 0;
    metrics = {
        messagesReceived: 0,
        lastMessageAt: 0,
        latencyMs: [],
        errorCount: 0,
        reconnectAttempts: 0,
    };
    MAX_RECONNECT_ATTEMPTS = 10;
    RECONNECT_DELAY_MS = 3000;
    HEARTBEAT_INTERVAL_MS = 15000; // 15s ping
    MAX_LATENCY_SAMPLE_SIZE = 100;
    constructor(config) {
        this.config = config;
    }
    connect() {
        if (this.ws)
            return;
        console.log(`[WS] Connecting to ${this.config.url}`);
        this.ws = new WebSocket(this.config.url);
        this.ws.onopen = () => this.handleOpen();
        this.ws.onmessage = (event) => this.handleMessage(event.data);
        this.ws.onerror = (event) => this.handleError(new Error('WebSocket error'));
        this.ws.onclose = () => this.handleClose();
    }
    handleOpen() {
        console.log(`[WS] Connected: ${this.config.instrumentId}@${this.config.channel}`);
        this.startHeartbeat();
        this.metrics.reconnectAttempts = 0;
        // Subscribe to stream
        const subscription = {
            id: ++this.sequence,
            type: 'subscribe',
            pair: this.config.instrumentId.toLowerCase(),
            channel: this.config.channel,
        };
        this.ws?.send(JSON.stringify(subscription));
        if (this.config.onConnect)
            this.config.onConnect();
    }
    handleMessage(data) {
        const receivedAt = Date.now();
        const startTime = receivedAt - this.metrics.latencyMs.reduce((a, b) => a + b, 0) / (this.metrics.latencyMs.length || 1);
        try {
            // Efficient JSON parsing
            const payload = JSON.parse(data);
            // Extract exchange timestamp for latency calculation
            const exchangeTimestamp = payload.t || payload.timestamp || payload.Time;
            const latencyMs = exchangeTimestamp ? Math.max(0, receivedAt - exchangeTimestamp) : 0;
            // Track latency
            if (latencyMs > 0) {
                this.metrics.latencyMs.push(latencyMs);
                if (this.metrics.latencyMs.length > this.MAX_LATENCY_SAMPLE_SIZE) {
                    this.metrics.latencyMs.shift();
                }
            }
            this.metrics.messagesReceived++;
            this.metrics.lastMessageAt = receivedAt;
            // Pass to consumer
            this.config.onMessage(payload);
        }
        catch (error) {
            this.metrics.errorCount++;
            this.config.onError?.(error);
        }
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket_OPEN) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                    console.log(`[WS] Ping sent: ${this.config.instrumentId}`);
                }
                catch (e) {
                    // Ignore ping errors
                }
            }
        }, this.HEARTBEAT_INTERVAL_MS);
    }
    handleError(error) {
        this.metrics.errorCount++;
        console.error(`[WS] Error: ${this.config.instrumentId}`, error);
        this.config.onError?.(error);
        this.scheduleReconnect();
    }
    handleClose() {
        console.log(`[WS] Disconnected: ${this.config.instrumentId}`);
        this.stopHeartbeat();
        this.config.onDisconnect?.();
        this.scheduleReconnect();
    }
    scheduleReconnect() {
        if (this.metrics.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error(`[WS] Max reconnect attempts reached: ${this.config.instrumentId}`);
            return;
        }
        const delay = this.RECONNECT_DELAY_MS * (this.metrics.reconnectAttempts + 1);
        this.metrics.reconnectAttempts++;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.metrics.reconnectAttempts})`);
        this.reconnectTimeout = setTimeout(() => {
            this.ws = null;
            this.connect();
        }, delay);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    disconnect() {
        this.stopHeartbeat();
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            try {
                this.ws.close();
            }
            catch (e) {
                // Ignore close errors
            }
            this.ws = null;
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getAverageLatency() {
        if (this.metrics.latencyMs.length === 0)
            return 0;
        return this.metrics.latencyMs.reduce((a, b) => a + b, 0) / this.metrics.latencyMs.length;
    }
}
export const cryptoWebSocketManager = new CryptoWebSocketManager({
    url: '',
    instrumentId: '',
    sourceId: '',
    channel: 'trades',
    onMessage: () => { },
});
