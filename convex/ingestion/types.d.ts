export interface ExchangeAdapter {
    sourceId: string;
    name: string;
    wsUrl: string;
    connect(): Promise<void>;
    disconnect(): void;
    subscribe(symbols: string[], channels: string[]): void;
    onMessage(handler: (msg: NormalizedMessage) => void): void;
}
export interface NormalizedMessage {
    sourceId: string;
    instrumentId: string;
    channel: string;
    sequence?: number;
    tsUtc: number;
    receivedAt: number;
    payload: Record<string, unknown>;
}
export interface OrderBookLevel {
    price: number;
    size: number;
}
export interface NormalizedTrade {
    tradeId?: string;
    price: number;
    size: number;
    side: 'buy' | 'sell' | 'unknown';
    isMakerOrder?: boolean;
    tsUtc: number;
}
