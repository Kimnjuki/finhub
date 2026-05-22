import { defineAction, action } from "convex/server";
import { query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Get all instruments with optional filters
export const getInstruments = query({
  async handler(ctx, { 
    assetClass, 
    exchange, 
    limit = 100, 
    cursorMark 
  }: { 
    assetClass?: string; 
    exchange?: string; 
    limit?: number; 
    cursorMark?: number;
  }) {
    // Check entitlements first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "market_data");
    if (!access.allowed) throw new Error(access.reason);

    let query = ctx.db.query("marketInstruments").filter((q: any) => q.eq("active", true));

    if (assetClass) {
      query = query.filter((q: any) => q.eq("assetClass", assetClass));
    }

    if (exchange) {
      query = query.filter((q: any) => q.eq("exchange", exchange));
    }

    if (cursorMark) {
      query = query.after("createdAt", cursorMark);
    }

    const instruments = await query.order("createdAt", "desc").take(limit).collect();

    // Get total count for pagination
    const total = await ctx.db.query("marketInstruments").filter((q: any) => q.eq("active", true)).count();

    return {
      instruments,
      total,
      hasMore: instruments.length < total,
    };
  },
});

// Get instrument details by symbol
export const getInstrument = query({
  async handler(ctx, { symbol }: { symbol: string }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "market_data");
    if (!access.allowed) throw new Error(access.reason);

    return ctx.db.query("marketInstruments").withIndex("by_symbol", (q: any) => q.eq("symbol", symbol)).first();
  },
});

// Helper function for access control (will be implemented properly later)
async function checkAccess(ctx: any, userId: string, feature: string) {
  // This is a simplified version - in production, this would check user entitlements
  return { allowed: true, reason: "Access denied" };
}
