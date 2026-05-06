import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("follows")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    filterType: v.string(),
    filterValue: v.string(),
  },
  handler: async (ctx, { userId, filterType, filterValue }) => {
    const followData: any = {
      supabaseId: `conv-${Date.now()}`,
      userId,
      createdAt: Date.now(),
    };
    followData[filterType] = filterValue;
    return ctx.db.insert("follows", followData);
  },
});

export const remove = mutation({
  args: { followId: v.id("follows") },
  handler: async (ctx, { followId }) => {
    await ctx.db.delete(followId);
  },
});
