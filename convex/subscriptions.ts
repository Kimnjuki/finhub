import { query } from "./_generated/server";
import { v } from "convex/values";

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
