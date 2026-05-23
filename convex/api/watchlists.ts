/// <reference path="../../src/types.d.ts" />
import { defineAction, action } from "convex/server";
import { query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Create a new watchlist
export const createWatchlist = action({
  async handler(ctx: any, { 
    userId, 
    name, 
    description,
    isPublic,
    color 
  }: { 
    userId: string;
    name: string;
    description?: string;
    isPublic?: boolean;
    color?: string;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "watchlists");
    if (!access.allowed) throw new Error(access.reason);

    const watchlist = await ctx.db.insert("watchlists", {
      userId,
      name,
      description,
      isPublic: isPublic || false,
      color,
      sortOrder: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return watchlist;
  },
});

// Get user's watchlists
export const getWatchlists = query({
  async handler(ctx: any, { userId }: { userId: string }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "watchlists");
    if (!access.allowed) throw new Error(access.reason);

    return ctx.db.query("watchlists")
      .filter((q: any) => q.eq("userId", userId))
      .order("sortOrder", "desc")
      .collect();
  },
});

// Add instrument to watchlist
export const addToWatchlist = action({
  async handler(ctx: any, { 
    watchlistId, 
    instrumentId 
  }: { 
    watchlistId: string; 
    instrumentId: string;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "watchlists");
    if (!access.allowed) throw new Error(access.reason);

    // Check if already in watchlist
    const existing = await ctx.db.query("watchlistItems")
      .filter((q: any) => q.eq("watchlistId", watchlistId))
      .filter((q: any) => q.eq("instrumentId", instrumentId))
      .first();

    if (!existing) {
      await ctx.db.insert("watchlistItems", {
        watchlistId,
        instrumentId,
        addedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Remove instrument from watchlist
export const removeFromWatchlist = action({
  async handler(ctx: any, { watchlistId, instrumentId }: { watchlistId: string; instrumentId: string }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "watchlists");
    if (!access.allowed) throw new Error(access.reason);

    const item = await ctx.db.query("watchlistItems")
      .filter((q: any) => q.eq("watchlistId", watchlistId))
      .filter((q: any) => q.eq("instrumentId", instrumentId))
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }

    return { success: true };
  },
});

// Helper function for access control (will be implemented properly later)
async function checkAccess(ctx: any, userId: string, feature: string) {
  // This is a simplified version - in production, this would check user entitlements
  return { allowed: true, reason: "Access denied" };
}