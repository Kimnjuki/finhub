import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const listByUser = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return ctx.db
            .query("eventSubscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});
export const checkSubscribed = query({
    args: { userId: v.string(), eventId: v.string() },
    handler: async (ctx, { userId, eventId }) => {
        const sub = await ctx.db
            .query("eventSubscriptions")
            .withIndex("by_user_and_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
            .first();
        return !!sub;
    },
});
export const subscribe = mutation({
    args: {
        userId: v.string(),
        eventId: v.string(),
        channels: v.array(v.string()),
        leadTimes: v.array(v.number()),
    },
    handler: async (ctx, { userId, eventId, channels, leadTimes }) => {
        const existing = await ctx.db
            .query("eventSubscriptions")
            .withIndex("by_user_and_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
            .first();
        if (existing)
            return existing._id;
        return ctx.db.insert("eventSubscriptions", {
            userId,
            eventId,
            channels,
            leadTimes,
            createdAt: Date.now(),
        });
    },
});
export const unsubscribe = mutation({
    args: { subscriptionId: v.id("eventSubscriptions") },
    handler: async (ctx, { subscriptionId }) => {
        await ctx.db.delete(subscriptionId);
    },
});
