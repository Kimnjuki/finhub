import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return ctx.db
      .query("events")
      .withIndex("by_start_ts")
      .order("asc")
      .collect();
  },
});

export const listByDateRange = query({
  args: { startTs: v.number(), endTs: v.number() },
  handler: async (ctx: any, { startTs, endTs }: { startTs: number; endTs: number }) => {
    return ctx.db
      .query("events")
      .withIndex("by_start_ts", (q: any) =>
        q.gte("startTsUtc", startTs).lte("startTsUtc", endTs)
      )
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx: any, { slug }: { slug: string }) => {
    return ctx.db
      .query("events")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
  },
});

export const getRelated = query({
  args: { category: v.string(), excludeSlug: v.string() },
  handler: async (ctx: any, { category, excludeSlug }: { category: string; excludeSlug: string }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_category", (q: any) =>
        q.eq(
          "category",
          category as "macro" | "crypto" | "earnings" | "other"
        )
      )
      .collect();
    return events.filter((e: any) => e.slug !== excludeSlug).slice(0, 3);
  },
});

export const getEventMeta = query({
  args: { eventId: v.string() },
  handler: async (ctx: any, { eventId }: { eventId: string }) => {
    return ctx.db
      .query("eventMeta")
      .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
      .collect();
  },
});

export const checkSlugExists = query({
  args: { slug: v.string() },
  handler: async (ctx: any, { slug }: { slug: string }) => {
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    return !!existing;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("macro"),
      v.literal("crypto"),
      v.literal("earnings"),
      v.literal("other")
    ),
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    startTsUtc: v.number(),
    country: v.optional(v.string()),
    symbols: v.array(v.string()),
    coins: v.array(v.string()),
    slug: v.string(),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("tentative"),
        v.literal("postponed"),
        v.literal("canceled"),
        v.literal("complete")
      )
    ),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    return ctx.db.insert("events", {
      ...args,
      status: args.status ?? "scheduled",
      symbols: args.symbols ?? [],
      coins: args.coins ?? [],
      createdAt: now,
      updatedAt: now,
    });
  },
});
