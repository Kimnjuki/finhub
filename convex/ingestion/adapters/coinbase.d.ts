import { ExchangeAdapter, NormalizedMessage } from "../types";
export declare class CoinbaseAdapter implements ExchangeAdapter {
    sourceId: "coinbase";
    name: string;
    wsUrl: string;
    private handlers;
    private ws?;
    private reconnectInterval;
    private maxReconnectInterval;
    private reconnectAttempts;
    private heartbeatInterval?;
    private messageQueue;
    connect(): Promise<void>;
    disconnect(): void;
    subscribe(symbols: string[], channels: string[]): void;
    onMessage(handler: (msg: NormalizedMessage) => void): void;
    private handleMessage;
    private flushMessageQueue;
    private normalizeSymbol;
    private startHeartbeat;
    private stopHeartbeat;
    private attemptReconnect;
    ingestData(msg: NormalizedMessage): Promise<void>;
}
