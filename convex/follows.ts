import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx: any, { userId }: { userId: string }) => {
    return ctx.db
      .query("follows")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    filterType: v.string(),
    filterValue: v.string(),
  },
  handler: async (ctx: any, { userId, filterType, filterValue }: { userId: string; filterType: string; filterValue: string }) => {
    const followData: any = {
      userId,
      createdAt: Date.now(),
    };
    followData[filterType] = filterValue;
    return ctx.db.insert("follows", followData);
  },
});

export const remove = mutation({
  args: { followId: v.id("follows") },
  handler: async (ctx: any, { followId }: { followId: string }) => {
    await ctx.db.delete(followId);
  },
});
