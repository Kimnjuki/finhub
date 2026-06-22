// binance-streams.ts
// Binance WebSocket integration for low-latency crypto data feeds
import { CryptoWebSocketManager } from './cryptoWebSocketManager';
export class BinanceStream {
    streams = new Map();
    // Binance WebSocket endpoints
    static BASE_URL = 'wss://stream.binance.com:9443/ws';
    subscribeTrades(instrumentId, sourceId, onTrade) {
        const streamId = `${instrumentId}@trades`;
        if (this.streams.has(streamId))
            return;
        const url = `${BinanceStream.BASE_URL}/${instrumentId.toLowerCase()}@trade`;
        const manager = new CryptoWebSocketManager({
            url,
            instrumentId,
            sourceId,
            channel: 'trades',
            onMessage: (payload) => {
                const trade = {
                    s: payload.s,
                    p: payload.p,
                    q: payload.q,
                    T: payload.T,
                    m: payload.m,
                };
                onTrade(trade);
            },
            onError: (error) => console.error(`Binance trade error: ${error}`),
            onConnect: () => console.log(`Binance trades connected: ${instrumentId}`),
            onDisconnect: () => console.log(`Binance trades disconnected: ${instrumentId}`),
        });
        manager.connect();
        this.streams.set(streamId, manager);
    }
    subscribeOrderBook(instrumentId, sourceId, depth = 20) {
        const streamId = `${instrumentId}@orderbook_${depth}`;
        if (this.streams.has(streamId))
            return;
        const url = `${BinanceStream.BASE_URL}/${instrumentId.toLowerCase()}@depth${depth}`;
        const manager = new CryptoWebSocketManager({
            url,
            instrumentId,
            sourceId,
            channel: 'orderbook_l2',
            onMessage: (payload) => {
                const orderbook = {
                    lastUpdateId: payload.lastUpdateId,
                    bids: payload.b || [],
                    asks: payload.a || [],
                };
                // Process bids/asks
                console.log('Orderbook update:', {
                    symbol: instrumentId,
                    bids: orderbook.bids.length,
                    asks: orderbook.asks.length,
                    lastUpdateId: orderbook.lastUpdateId,
                });
            },
        });
        manager.connect();
        this.streams.set(streamId, manager);
    }
    subscribeKline(instrumentId, sourceId, interval = '1m') {
        const streamId = `${instrumentId}@kline_${interval}`;
        if (this.streams.has(streamId))
            return;
        const url = `${BinanceStream.BASE_URL}/${instrumentId.toLowerCase()}@kline_${interval}`;
        const manager = new CryptoWebSocketManager({
            url,
            instrumentId,
            sourceId,
            channel: 'kline',
            onMessage: (payload) => {
                const kline = payload.k;
                console.log('Kline update:', {
                    symbol: instrumentId,
                    interval: kline.i,
                    open: kline.o,
                    high: kline.h,
                    low: kline.l,
                    close: kline.c,
                    volume: kline.v,
                    trades: kline.n,
                });
            },
        });
        manager.connect();
        this.streams.set(streamId, manager);
    }
    unsubscribe(instrumentId, channel) {
        const streamId = `${instrumentId}@${channel}`;
        const stream = this.streams.get(streamId);
        if (stream) {
            stream.disconnect();
            this.streams.delete(streamId);
        }
    }
    getMetrics() {
        const metrics = new Map();
        this.streams.forEach((stream, streamId) => {
            metrics.set(streamId, {
                ...stream.getMetrics(),
                avgLatency: stream.getAverageLatency(),
            });
        });
        return metrics;
    }
    getAllStreams() {
        return Array.from(this.streams.keys());
    }
    isSubscribed(instrumentId, channel) {
        const streamId = `${instrumentId}@${channel}`;
        return this.streams.has(streamId);
    }
}
export const binanceStream = new BinanceStream();
