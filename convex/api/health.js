import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
// Get stream health summary for all sources
export const getStreamHealthSummary = query({
    args: {},
    handler: async (ctx) => {
        const streams = await ctx.db.query("marketStreams").collect();
        const sourceIds = streams.map((s) => s.sourceId);
        const sources = new Set(sourceIds);
        const summary = {};
        for (const sourceId of sources) {
            const sourceStreams = streams.filter((s) => s.sourceId === sourceId);
            summary[sourceId] = {
                total: sourceStreams.length,
                active: sourceStreams.filter((s) => s.status === "active").length,
                stale: sourceStreams.filter((s) => s.status === "stale").length,
                resyncing: sourceStreams.filter((s) => s.status === "resyncing").length,
                disabled: sourceStreams.filter((s) => s.status === "disabled").length,
                lastMessageAt: Math.max(...sourceStreams.map((s) => s.lastMessageAt ?? 0), 0),
            };
        }
        return summary;
    },
});
// Get all stream health details
export const getStreamDetails = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("marketStreams")
            .order("desc")
            .take(100);
    },
});
// Get data source reliability metrics
export const getSourceReliability = query({
    args: {},
    handler: async (ctx) => {
        const sources = await ctx.db.query("marketSources").collect();
        const streams = await ctx.db.query("marketStreams").collect();
        return sources.map((source) => {
            const sourceStreams = streams.filter((s) => s.sourceId === source.name.toLowerCase());
            const totalStreams = sourceStreams.length;
            const activeStreams = sourceStreams.filter((s) => s.status === "active").length;
            const errorRate = totalStreams > 0
                ? sourceStreams.reduce((sum, s) => sum + (s.errorCount ?? 0), 0) / totalStreams
                : 0;
            return {
                id: source._id,
                name: source.name,
                type: source.sourceType,
                region: source.region,
                reliability: source.reliability,
                uptimePercent: source.uptimePercent,
                latencyMs: source.latencyMs,
                active: source.active,
                totalStreams,
                activeStreams,
                healthPercent: totalStreams > 0 ? Math.round((activeStreams / totalStreams) * 100) : 0,
                errorRate: Math.round(errorRate * 100) / 100,
                lastMessageAt: Math.max(...sourceStreams.map((s) => s.lastMessageAt ?? 0), 0),
            };
        });
    },
});
// Record data lineage entry
export const recordDataLineage = mutation({
    args: {
        sourceId: v.string(),
        instrumentId: v.string(),
        channel: v.string(),
        sequence: v.optional(v.number()),
        checksum: v.optional(v.string()),
        latencyMs: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("streamMessages", {
            sourceId: args.sourceId,
            instrumentId: args.instrumentId,
            channel: args.channel,
            payloadRef: `lineage_${Date.now()}`,
            sequence: args.sequence,
            tsUtc: Date.now(),
            receivedAt: Date.now(),
            processingMs: args.latencyMs,
            createdAt: Date.now(),
        });
    },
});
// Get data lineage for an instrument
export const getDataLineage = query({
    args: { instrumentId: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, { instrumentId, limit = 50 }) => {
        return await ctx.db
            .query("streamMessages")
            .withIndex("by_instrument", (q) => q.eq("instrumentId", instrumentId))
            .order("desc")
            .take(limit);
    },
});
// Record stream health check
export const recordHealthCheck = mutation({
    args: {
        sourceId: v.string(),
        channel: v.string(),
        status: v.union(v.literal("active"), v.literal("stale"), v.literal("resyncing"), v.literal("disabled")),
        errorMsg: v.optional(v.string()),
    },
    handler: async (ctx, { sourceId, channel, status, errorMsg }) => {
        const stream = await ctx.db
            .query("marketStreams")
            .withIndex("by_source_and_channel", (q) => q.eq("sourceId", sourceId).eq("channel", channel))
            .first();
        const now = Date.now();
        if (stream) {
            await ctx.db.patch(stream._id, {
                status,
                lastMessageAt: status === "active" ? now : stream.lastMessageAt,
                errorCount: errorMsg ? (stream.errorCount ?? 0) + 1 : stream.errorCount,
                lastErrorAt: errorMsg ? now : stream.lastErrorAt,
                lastErrorMsg: errorMsg ?? stream.lastErrorMsg,
                updatedAt: now,
            });
        }
    },
});
// Get system infrastructure status
export const getInfrastructureStatus = query({
    args: {},
    handler: async (ctx) => {
        const streams = await ctx.db.query("marketStreams").collect();
        const sources = await ctx.db.query("marketSources").collect();
        const now = Date.now();
        const activeStreams = streams.filter((s) => s.status === "active");
        const staleStreams = streams.filter((s) => s.status === "stale");
        const avgLatency = streams.reduce((sum, s) => {
            return sum + (s.lastMessageAt ? (now - s.lastMessageAt) : 0);
        }, 0) / (streams.length || 1);
        return {
            totalSources: sources.length,
            activeSources: sources.filter((s) => s.active).length,
            totalStreams: streams.length,
            activeStreams: activeStreams.length,
            staleStreams: staleStreams.length,
            streamHealthPercent: streams.length > 0
                ? Math.round((activeStreams.length / streams.length) * 100)
                : 0,
            avgLatencyMs: Math.round(avgLatency),
            lastUpdated: now,
        };
    },
});
