import { defineAction, action } from "convex/server";

// Stream health check action - can be scheduled separately
export const checkStreamHealth = defineAction({
  handler: async (ctx) => {
    // Get all active market streams
    const streams = await ctx.db.query("marketStreams").withIndex("by_status", (q) => q.eq("status", "active")).collect();

    const now = Date.now();

    for (const stream of streams) {
      const lastMessageAt = stream.lastMessageAt;
      if (!lastMessageAt) continue;

      let threshold = 300000; // 5 minutes default
      let channelName = "";

      switch (stream.channel) {
        case "trades":
          threshold = 30000; // 30 seconds
          channelName = "trades";
          break;
        case "orderbook_l2":
          threshold = 10000; // 10 seconds
          channelName = "orderbook_l2";
          break;
        case "ticker":
          threshold = 15000; // 15 seconds
          channelName = "ticker";
          break;
        case "ohlcv":
          threshold = 60000; // 1 minute
          channelName = "ohlcv";
          break;
        case "funding":
          threshold = 300000; // 5 minutes
          channelName = "funding";
          break;
        case "open_interest":
          threshold = 60000; // 1 minute
          channelName = "open_interest";
          break;
        case "liquidations":
          threshold = 300000; // 5 minutes
          channelName = "liquidations";
          break;
        default:
          console.warn(`Unknown channel: ${stream.channel}`);
          continue;
      }

      const timeSinceLastMessage = now - lastMessageAt;

      if (timeSinceLastMessage > threshold) {
        console.error(`Stream ${stream.sourceId}/${stream.instrumentId}/${stream.channel} is stale! Last message: ${lastMessageAt}, now: ${now}`);
        // Mark stream as stale and trigger resync
        await ctx.db.patch(stream._id, {
          status: "stale",
          lastErrorAt: now,
          lastErrorMsg: `No messages received for ${timeSinceLastMessage}ms (threshold: ${threshold}ms)`,
        });

        // TODO: Trigger resync mutation
      }
    }

    return { success: true };
  },
});