import { ExchangeAdapter, NormalizedMessage } from "../types";
export declare class BinanceAdapter implements ExchangeAdapter {
    sourceId: "binance";
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
    private normalizeChannel;
    private mapBinanceEventToChannel;
    private mapBinanceChannelToStandard;
    private startHeartbeat;
    private stopHeartbeat;
    private attemptReconnect;
}
