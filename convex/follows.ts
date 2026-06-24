import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const followUser = mutation({
  args: { userId: v.string(), targetUserId: v.string() },
  async handler(ctx: any, args: any) {
    if (args.userId === args.targetUserId) throw new Error("Cannot follow yourself");
    const existing = await ctx.db.query("follows")
      .withIndex("by_user_target", (q: any) => q.eq("userId", args.userId).eq("targetId", args.targetUserId))
      .first();
    if (existing) return { success: true, followId: existing._id, alreadyFollowing: true };
    const followId = await ctx.db.insert("follows", {
      userId: args.userId,
      targetType: "user",
      targetId: args.targetUserId,
      createdAt: Date.now(),
    });
    return { success: true, followId, alreadyFollowing: false };
  },
});

export const unfollowUser = mutation({
  args: { userId: v.string(), targetUserId: v.string() },
  async handler(ctx: any, args: any) {
    const existing = await ctx.db.query("follows")
      .withIndex("by_user_target", (q: any) => q.eq("userId", args.userId).eq("targetId", args.targetUserId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const getFollowers = query({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const follows = await ctx.db.query("follows")
      .withIndex("by_target", (q: any) => q.eq("targetType", "user").eq("targetId", args.userId))
      .collect();
    return follows;
  },
});

export const getFollowing = query({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const follows = await ctx.db.query("follows")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();
    return follows;
  },
});

export const isFollowing = query({
  args: { userId: v.string(), targetUserId: v.string() },
  async handler(ctx: any, args: any) {
    const existing = await ctx.db.query("follows")
      .withIndex("by_user_target", (q: any) => q.eq("userId", args.userId).eq("targetId", args.targetUserId))
      .first();
    return { isFollowing: !!existing };
  },
});

export const getTradeFeed = query({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const following = await ctx.db.query("follows")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();
    const followedIds = following.map(f => f.targetId);
    if (followedIds.length === 0) return [];
    return { followedUserIds: followedIds, count: following.length };
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.float64()) },
  async handler(ctx: any, args: any) {
    const users = await ctx.db.query("users").order("desc").take(args.limit || 20);
    return users.map(u => ({
      userId: u._id,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      pnl: 0,
      winRate: 0,
      trades: 0,
    }));
  },
});
