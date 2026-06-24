import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

const levelOrder: Record<string, number> = { free: 0, basic: 1, advanced: 2, premium: 3, full: 4, enterprise: 5 };

export const checkAccess = query({
  args: { userId: v.string(), featureName: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db.query("userSubscriptions").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).first();
    if (!sub || sub.status !== "active") return { granted: false, reason: "No active subscription" };
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < Date.now()) return { granted: false, reason: "Subscription expired" };

    const entitlement = await ctx.db.query("entitlementModel").withIndex("by_user_feature", (q: any) => q.eq("userId", args.userId).eq("featureName", args.featureName)).first();
    if (entitlement) {
      return { granted: entitlement.accessLevel !== "free" && (!entitlement.expiresAt || entitlement.expiresAt > Date.now()) };
    }

    const plan = await ctx.db.query("subscriptionPlans").withIndex("by_name", (q: any) => q.eq("name", sub.planId)).first();
    if (!plan) return { granted: false, reason: "Plan not found" };

    const feature = await ctx.db.query("featureRegistry").withIndex("by_feature_name", (q: any) => q.eq("featureName", args.featureName)).first();
    if (!feature) return { granted: false, reason: "Feature not in registry" };

    const userLevel = levelOrder[sub.planId.toLowerCase()] ?? 0;
    const requiredLevel = levelOrder[feature.requiredAccessLevel] ?? 99;
    return { granted: userLevel >= requiredLevel, plan: sub.planId };
  },
});

export const getAccessibleFeatures = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const accessible: string[] = [];
    const features = await ctx.db.query("featureRegistry").withIndex("by_active", (q: any) => q.eq("isActive", true)).collect();
    const sub = await ctx.db.query("userSubscriptions").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).first();
    if (!sub || sub.status !== "active") return [];

    const plan = await ctx.db.query("subscriptionPlans").withIndex("by_name", (q: any) => q.eq("name", sub.planId)).first();
    if (!plan) return [];

    for (const feature of features) {
      if (plan.features.includes(feature.featureName)) accessible.push(feature.featureName);
    }
    return accessible;
  },
});

export const checkChannelAccess = query({
  args: {
    userId: v.string(),
    channel: v.union(v.literal("trades"), v.literal("ticker"), v.literal("orderbook_l1"), v.literal("orderbook_l2"), v.literal("signals"), v.literal("ai_predictions"), v.literal("alerts"), v.literal("portfolio")),
  },
  async handler(ctx, args) {
    const entitlement = await ctx.db.query("dataEntitlements").withIndex("by_user_source_channel", (q: any) => q.eq("userId", args.userId)).first();
    if (entitlement && entitlement.channel === args.channel && (!entitlement.expiresAt || entitlement.expiresAt > Date.now())) {
      return { granted: true, accessLevel: entitlement.accessLevel };
    }
    return { granted: false, reason: "No channel entitlement" };
  },
});

export const enforceAccess = mutation({
  args: { userId: v.string(), featureName: v.string(), action: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db.query("userSubscriptions").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).first();
    const granted = sub && sub.status === "active";

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: `${granted ? "access_granted" : "access_denied"}:${args.action}`,
      entityType: "feature",
      entityId: args.featureName,
      createdAt: Date.now(),
    });

    if (!granted) throw new Error("Access denied: No active subscription");
    return { granted: true };
  },
});