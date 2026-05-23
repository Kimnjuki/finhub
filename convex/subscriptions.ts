import { query } from "./_generated/server";
import { v } from "convex/values";

export const listActivePlans = query({
  args: {},
  handler: async (ctx: any) => {
    return ctx.db
      .query("subscriptionPlans")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .collect();
  },
});

export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx: any, { userId }: { userId: string }) => {
const sub = await ctx.db
  .query("userSubscriptions")
  .withIndex("by_user", (q: any) => q.eq("userId", userId))
  .filter((q: any) => q.eq(q.field("status"), "active"))
  .first();
    if (!sub) return null;
const plan = await ctx.db
  .query("subscriptionPlans")
  .withIndex("by_name")
  .filter((q: any) => q.eq(q.field("name"), sub.planId))
  .first();
    return { subscription: sub, plan };
  },
});