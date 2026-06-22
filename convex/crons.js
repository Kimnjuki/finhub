import { defineAction } from "convex/server";
// Action to monitor stream health every 30 seconds
export const monitorStreamHealth = defineAction({
    async handler(ctx) {
        // Check each market source and its streams
        const sources = ["binance", "coinbase", "kraken"];
        for (const source of sources) {
            // Check if WebSocket is connected
            const wsConnected = ctx.runtime.store.get(`ws_connected_${source}`) || false;
            // Update stream status
            const streams = await ctx.db.query("marketStreams")
                .withIndex("by_source", (q) => q.eq("sourceId", source))
                .collect();
            for (const stream of streams) {
                const status = wsConnected ? "active" : "stale";
                const now = Date.now();
                const lastMessageAt = stream.lastMessageAt || 0;
                const timeSinceLastMessage = now - lastMessageAt;
                // If WebSocket is connected but stream hasn't received message in 30 seconds, mark as stale
                const newStatus = (wsConnected && timeSinceLastMessage < 30000) ? "active" : "stale";
                if (newStatus !== stream.status) {
                    await ctx.db.patch(stream._id, {
                        status: newStatus,
                        lastCheckedAt: now,
                    });
                }
            }
        }
        return { success: true };
    },
});
// Action to run instrument registry bootstrap periodically (or on demand)
export const runInstrumentBootstrap = defineAction({
    async handler(ctx) {
        // Fetch instruments from all sources
        const sources = ["binance", "coinbase", "kraken"];
        for (const source of sources) {
            try {
                switch (source) {
                    case "binance":
                        await ctx.run("fetchBinanceInstruments");
                        break;
                    case "coinbase":
                        await ctx.run("fetchCoinbaseInstruments");
                        break;
                    case "kraken":
                        await ctx.run("fetchKrakenInstruments");
                        break;
                }
            }
            catch (err) {
                console.error(`[InstrumentBootstrap] Failed to fetch instruments from ${source}:`, err);
            }
        }
        return { success: true };
    },
});
