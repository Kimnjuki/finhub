// crypto-websocket-manager.ts
// Low-latency WebSocket manager for crypto exchange data feeds

export interface WebSocketConfig {
  url: string;
  instrumentId: string;
  sourceId: string;
  channel: 'trades' | 'ticker' | 'orderbook_l2' | 'kline';
  onMessage: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface StreamMetrics {
  messagesReceived: number;
  lastMessageAt: number;
  latencyMs: number[];
  errorCount: number;
  reconnectAttempts: number;
}

// WebSocket event types for browser compatibility
type WebSocketReadyState = number;
const WebSocket_CONNECTING = 0;
const WebSocket_OPEN = 1;
const WebSocket_CLOSING = 2;
const WebSocket_CLOSED = 3;

export class CryptoWebSocketManager {
  private ws: any | null = null;
  private config: WebSocketConfig;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private sequence: number = 0;
  private metrics: StreamMetrics = {
    messagesReceived: 0,
    lastMessageAt: 0,
    latencyMs: [],
    errorCount: 0,
    reconnectAttempts: 0,
  };

  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY_MS = 3000;
  private readonly HEARTBEAT_INTERVAL_MS = 15000; // 15s ping
  private readonly MAX_LATENCY_SAMPLE_SIZE = 100;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.ws) return;

    console.log(`[WS] Connecting to ${this.config.url}`);
    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event: MessageEvent) => this.handleMessage(event.data);
    this.ws.onerror = (event: Event) => this.handleError(new Error('WebSocket error'));
    this.ws.onclose = () => this.handleClose();
  }

  private handleOpen(): void {
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
    
    if (this.config.onConnect) this.config.onConnect();
  }

  private handleMessage(data: string | ArrayBuffer): void {
    const receivedAt = Date.now();
    const startTime = receivedAt - this.metrics.latencyMs.reduce((a, b) => a + b, 0) / (this.metrics.latencyMs.length || 1);
    
    try {
      // Efficient JSON parsing
      const payload = JSON.parse(data as string);
      
      // Extract exchange timestamp for latency calculation
      const exchangeTimestamp = (payload as any).t || (payload as any).timestamp || (payload as any).Time;
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
    } catch (error) {
      this.metrics.errorCount++;
      this.config.onError?.(error as Error);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket_OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
          console.log(`[WS] Ping sent: ${this.config.instrumentId}`);
        } catch (e) {
          // Ignore ping errors
        }
      }
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  private handleError(error: Error): void {
    this.metrics.errorCount++;
    console.error(`[WS] Error: ${this.config.instrumentId}`, error);
    this.config.onError?.(error);
    this.scheduleReconnect();
  }

  private handleClose(): void {
    console.log(`[WS] Disconnected: ${this.config.instrumentId}`);
    this.stopHeartbeat();
    this.config.onDisconnect?.();
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
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

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // Ignore close errors
      }
      this.ws = null;
    }
  }

  getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  getAverageLatency(): number {
    if (this.metrics.latencyMs.length === 0) return 0;
    return this.metrics.latencyMs.reduce((a, b) => a + b, 0) / this.metrics.latencyMs.length;
  }
}

export const cryptoWebSocketManager = new CryptoWebSocketManager({
  url: '',
  instrumentId: '',
  sourceId: '',
  channel: 'trades',
  onMessage: () => {},
});