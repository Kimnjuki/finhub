import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const listActivePlans = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("subscriptionPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (!sub) return null;
    const plan = await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_name")
      .filter((q) => q.eq(q.field("planId"), sub.planId))
      .first();
    return { subscription: sub, plan };
  },
});

export const listUpcomingEvents = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("macro"),
        v.literal("crypto"),
        v.literal("earnings"),
        v.literal("other")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit }) => {
    const now = Date.now();
    let results;
    if (category) {
      results = await ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.gt(q.field("startTsUtc"), now))
        .take(limit ?? 50);
    } else {
      results = await ctx.db
        .query("events")
        .withIndex("by_start_ts", (q) => q.gt("startTsUtc", now))
        .take(limit ?? 50);
    }
    return results.sort((a, b) => a.startTsUtc - b.startTsUtc);
  },
});

export const getUserRoles = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const userRoles = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return userRoles.map((ur) => ur.roleName);
  },
});

export const assignRole = mutation({
  args: { userId: v.string(), roleName: v.string() },
  handler: async (ctx, { userId, roleName }) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_user_and_role", (q) =>
        q.eq("userId", userId).eq("roleName", roleName)
      )
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("userRoles", {
      userId,
      roleName,
      assignedAt: Date.now(),
    });
  },
});

export const getUnreadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { isRead: true });
  },
});

export const hasFeatureAccess = query({
  args: { userId: v.string(), featureName: v.string() },
  handler: async (ctx, { userId, featureName }) => {
    const freeFeatures = ["calculator", "basic_news", "education", "faq"];
    if (freeFeatures.includes(featureName)) return true;

    const access = await ctx.db
      .query("featureAccess")
      .withIndex("by_user_and_feature", (q) =>
        q.eq("userId", userId).eq("featureName", featureName)
      )
      .first();

    if (!access) return false;
    if (access.expiresAt && access.expiresAt < Date.now()) return false;
    return true;
  },
});