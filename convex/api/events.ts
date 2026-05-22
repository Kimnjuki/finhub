import { defineAction, action } from "convex/server";
import { query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Get recent events
export const getEvents = query({
  async handler(ctx, { 
    category, 
    limit = 20, 
    afterTs 
  }: { 
    category?: string; 
    limit?: number; 
    afterTs?: number;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "events");
    if (!access.allowed) throw new Error(access.reason);

    let query = ctx.db.query("events");

    if (category) {
      query = query.filter((q: any) => q.eq("category", category));
    }

    if (afterTs) {
      query = query.after("startTsUtc", afterTs);
    }

    return query.order("startTsUtc", "desc").take(limit).collect();
  },
});

// Get recent news
export const getNews = query({
  async handler(ctx, { 
    coins, 
    limit = 20, 
    afterPublished 
  }: { 
    coins?: string[]; 
    limit?: number; 
    afterPublished?: number;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "news");
    if (!access.allowed) throw new Error(access.reason);

    let query = ctx.db.query("newsFeed");

    if (coins && coins.length > 0) {
      query = query.filter((q: any) => q.contains("coins", coins));
    }

    if (afterPublished) {
      query = query.after("publishedAt", afterPublished);
    }

    return query.order("publishedAt", "desc").take(limit).collect();
  },
});

// Helper function for access control (will be implemented properly later)
async function checkAccess(ctx: any, userId: string, feature: string) {
  // This is a simplified version - in production, this would check user entitlements
  return { allowed: true, reason: "Access denied" };
}
