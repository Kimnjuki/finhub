const DEFAULT_CONFIG = {
    url: '',
    sourceId: 'unknown',
    pingInterval: 20000, // 20s per Binance recommendation
    pingTimeout: 10000, // 10s timeout for pong
    reconnectBaseDelay: 1000, // 1s initial delay
    reconnectMaxDelay: 30000, // 30s max delay
    reconnectMaxAttempts: 50, // allow many reconnects
    requestTimeout: 10000, // 10s request timeout
    batchMessages: true,
    logLatency: true,
    latencyLogInterval: 60000, // log latency stats every 60s
};
export class WSOptimizer {
    ws = null;
    config;
    state = 'disconnected';
    reconnectAttempts = 0;
    reconnectTimer = null;
    pingTimer = null;
    pongTimer = null;
    lastPingTime = 0;
    lastPongTime = 0;
    messageQueue = [];
    flushTimer = null;
    handlers = [];
    requestIds = new Map();
    latencySamples = [];
    onConnectionStateChange;
    messageBuffer = [];
    bufferFlushInterval = null;
    lastMessageTime = 0;
    messagesReceived = 0;
    messagesSent = 0;
    errorsCount = 0;
    startTime = 0;
    // Public metrics
    latencyMetrics = {
        p50: 0, p95: 0, p99: 0, avg: 0, max: 0, min: 0,
        sampleCount: 0, lastUpdated: Date.now(),
    };
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    getState() { return this.state; }
    getReconnectAttempts() { return this.reconnectAttempts; }
    getMessagesReceived() { return this.messagesReceived; }
    getMessagesSent() { return this.messagesSent; }
    getErrors() { return this.errorsCount; }
    getUptime() { return this.state === 'connected' && this.startTime > 0 ? Date.now() - this.startTime : 0; }
    onStateChange(cb) {
        this.onConnectionStateChange = cb;
    }
    setState(newState) {
        const prev = this.state;
        this.state = newState;
        if (prev !== newState) {
            console.log(`[${this.config.sourceId}] State: ${prev} → ${newState} (attempts: ${this.reconnectAttempts})`);
            this.onConnectionStateChange?.(newState, this.config.sourceId);
        }
    }
    async connect(url) {
        if (url)
            this.config.url = url;
        if (!this.config.url)
            throw new Error(`[${this.config.sourceId}] No WebSocket URL configured`);
        this.setState('connecting');
        return new Promise((resolve, reject) => {
            try {
                // @ts-ignore
                this.ws = new WebSocket(this.config.url);
                const connectTimeout = setTimeout(() => {
                    if (this.state === 'connecting') {
                        this.ws?.close();
                        reject(new Error(`[${this.config.sourceId}] Connection timeout`));
                    }
                }, 10000);
                this.ws.onopen = () => {
                    clearTimeout(connectTimeout);
                    this.startTime = Date.now();
                    this.reconnectAttempts = 0;
                    this.setState('connected');
                    this.startHeartbeat();
                    this.startBufferFlush();
                    this.flushMessageQueue();
                    console.log(`[${this.config.sourceId}] WebSocket connected in ${Date.now() - this.startTime}ms`);
                    resolve();
                };
                this.ws.onclose = (event) => {
                    this.stopHeartbeat();
                    this.stopBufferFlush();
                    this.setState('disconnected');
                    console.log(`[${this.config.sourceId}] Closed code=${event.code} reason=${event.reason || 'none'}`);
                    this.attemptReconnect();
                };
                this.ws.onerror = (error) => {
                    this.errorsCount++;
                    console.error(`[${this.config.sourceId}] Error:`, error?.message || 'unknown');
                    this.setState('degraded');
                    if (this.state === 'connecting') {
                        clearTimeout(connectTimeout);
                        reject(error);
                    }
                };
                this.ws.onmessage = (event) => {
                    this.messagesReceived++;
                    this.lastMessageTime = Date.now();
                    try {
                        const data = JSON.parse(event.data);
                        this.handleIncomingMessage(data);
                    }
                    catch (err) {
                        console.error(`[${this.config.sourceId}] Parse error:`, err);
                    }
                };
            }
            catch (err) {
                reject(err);
            }
        });
    }
    disconnect() {
        this.stopHeartbeat();
        this.stopBufferFlush();
        this.stopReconnect();
        if (this.ws) {
            try {
                this.ws.close(1000, 'Client disconnect');
            }
            catch { }
            this.ws = null;
        }
        this.setState('disconnected');
        this.messageQueue = [];
        this.messageBuffer = [];
        this.requestIds.clear();
        this.startTime = 0;
    }
    /**
     * Send a message with optional request ID for latency tracking
     */
    async sendMessage(message, trackLatency = false) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // Queue for later delivery
            this.messageQueue.push(JSON.stringify(message));
            return null;
        }
        const requestId = trackLatency ? `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` : null;
        if (requestId) {
            const payload = { ...message, id: requestId };
            this.requestIds.set(requestId, Date.now());
            // Set timeout for this request
            setTimeout(() => {
                if (this.requestIds.has(requestId)) {
                    this.requestIds.delete(requestId);
                    console.warn(`[${this.config.sourceId}] Request ${requestId} timed out`);
                }
            }, this.config.requestTimeout);
            this.messagesSent++;
            this.ws.send(JSON.stringify(payload));
            return requestId;
        }
        this.messagesSent++;
        this.ws.send(JSON.stringify(message));
        return null;
    }
    /**
     * Send a raw JSON string (lowest latency - no allocations)
     */
    sendRaw(jsonString) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.messageQueue.push(jsonString);
            return false;
        }
        this.messagesSent++;
        this.ws.send(jsonString);
        return true;
    }
    /**
     * Subscribe to multiple streams via single consolidated message
     */
    subscribe(symbols, channels, symbolTransform) {
        const params = [];
        for (const symbol of symbols) {
            const s = symbolTransform ? symbolTransform(symbol) : symbol.toLowerCase();
            for (const channel of channels) {
                params.push(`${s}@${channel}`);
            }
        }
        if (params.length > 0) {
            this.sendMessage({
                method: 'SUBSCRIBE',
                params,
                id: Date.now(),
            }, true);
            console.log(`[${this.config.sourceId}] Subscribed: ${params.length} streams`);
        }
    }
    onMessage(handler) {
        this.handlers.push(handler);
    }
    /**
     * Get current latency metrics snapshot
     */
    getLatencyMetrics() {
        return { ...this.latencyMetrics };
    }
    /**
     * Reset latency tracking
     */
    resetLatencyMetrics() {
        this.latencySamples = [];
        this.latencyMetrics = {
            p50: 0, p95: 0, p99: 0, avg: 0, max: 0, min: 0,
            sampleCount: 0, lastUpdated: Date.now(),
        };
    }
    // Private methods
    handleIncomingMessage(data) {
        // Track response latency via request ID
        if (data.id && this.requestIds.has(data.id)) {
            const sentTime = this.requestIds.get(data.id);
            this.requestIds.delete(data.id);
            const latencyMs = Date.now() - sentTime;
            this.recordLatencySample(latencyMs);
        }
        // Handle pong response
        if (data.type === 'pong' || data.event === 'pong') {
            this.lastPongTime = Date.now();
            this.clearPongTimer();
            return;
        }
        const normalized = {
            sourceId: this.config.sourceId,
            instrumentId: '',
            channel: '',
            tsUtc: Date.now(),
            receivedAt: Date.now(),
            payload: data,
        };
        this.handlers.forEach(h => h(normalized));
    }
    recordLatencySample(latencyMs) {
        this.latencySamples.push(latencyMs);
        if (this.latencySamples.length > 1000) {
            this.latencySamples.shift(); // Keep last 1000 samples
        }
        this.updateLatencyMetrics();
    }
    updateLatencyMetrics() {
        const samples = this.latencySamples;
        if (samples.length === 0)
            return;
        const sorted = [...samples].sort((a, b) => a - b);
        const len = sorted.length;
        this.latencyMetrics = {
            p50: sorted[Math.floor(len * 0.5)],
            p95: sorted[Math.floor(len * 0.95)],
            p99: sorted[Math.floor(len * 0.99)],
            avg: samples.reduce((a, b) => a + b, 0) / len,
            max: sorted[len - 1],
            min: sorted[0],
            sampleCount: len,
            lastUpdated: Date.now(),
        };
    }
    startHeartbeat() {
        this.lastPongTime = Date.now();
        // Periodic ping per Binance recommendation (20s interval)
        this.pingTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.lastPingTime = Date.now();
                this.sendMessage({ method: 'ping', params: [], id: Date.now() });
                // Set pong timeout - if no pong within pingTimeout, reconnect
                this.pongTimer = setTimeout(() => {
                    const elapsed = Date.now() - this.lastPingTime;
                    console.warn(`[${this.config.sourceId}] No pong received in ${elapsed}ms, reconnecting...`);
                    this.errorsCount++;
                    this.reconnect();
                }, this.config.pingTimeout);
            }
        }, this.config.pingInterval);
        // Log latency metrics periodically
        if (this.config.logLatency) {
            setInterval(() => {
                if (this.latencyMetrics.sampleCount > 0) {
                    console.log(`[${this.config.sourceId}] Latency: P50=${this.latencyMetrics.p50.toFixed(0)}ms P95=${this.latencyMetrics.p95.toFixed(0)}ms P99=${this.latencyMetrics.p99.toFixed(0)}ms samples=${this.latencyMetrics.sampleCount}`);
                }
            }, this.config.latencyLogInterval);
        }
    }
    stopHeartbeat() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.clearPongTimer();
    }
    clearPongTimer() {
        if (this.pongTimer) {
            clearTimeout(this.pongTimer);
            this.pongTimer = null;
        }
    }
    /**
     * Buffer and batch outgoing messages to reduce WebSocket writes
     */
    startBufferFlush() {
        this.bufferFlushInterval = setInterval(() => {
            if (this.messageBuffer.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
                const batch = this.messageBuffer.splice(0);
                this.ws.send(JSON.stringify(batch.length === 1 ? batch[0] : batch));
            }
        }, 50); // Flush every 50ms
    }
    stopBufferFlush() {
        if (this.bufferFlushInterval) {
            clearInterval(this.bufferFlushInterval);
            this.bufferFlushInterval = null;
        }
    }
    /**
     * Exponential backoff reconnection with jitter
     * Base: 1s → 2s → 4s → 8s → ... → max 30s
     * Jitter: ±25% to prevent thundering herd
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.config.reconnectMaxAttempts) {
            console.error(`[${this.config.sourceId}] Max reconnect attempts (${this.config.reconnectMaxAttempts}) reached`);
            this.setState('disconnected');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.config.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1), this.config.reconnectMaxDelay);
        // Add jitter: ±25%
        const jitter = delay * (0.75 + Math.random() * 0.5);
        console.log(`[${this.config.sourceId}] Reconnecting in ${jitter.toFixed(0)}ms (attempt ${this.reconnectAttempts}/${this.config.reconnectMaxAttempts})`);
        this.setState('connecting');
        this.reconnectTimer = setTimeout(() => this.reconnect(), jitter);
    }
    async reconnect() {
        try {
            await this.connect();
        }
        catch {
            // connect() will trigger attemptReconnect on failure
        }
    }
    stopReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const msg = this.messageQueue.shift();
            this.ws.send(msg);
            this.messagesSent++;
        }
    }
}
