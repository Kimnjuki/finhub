import { mutation, query, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const activateSubscription = internalMutation({
  args: {
    userId: v.string(),
    planId: v.string(),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    stripeSubscriptionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    trialEndsAt: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        planId: args.planId,
        status: "active",
        billingCycle: args.billingCycle,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
        trialEndsAt: args.trialEndsAt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSubscriptions", {
        userId: args.userId,
        planId: args.planId,
        status: "active",
        billingCycle: args.billingCycle,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
        trialEndsAt: args.trialEndsAt,
        cancelAtPeriodEnd: false,
        supabaseId: `internal_${args.userId}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const extendSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    currentPeriodEnd: v.number(),
  },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_id", (q: any) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    if (sub) {
      await ctx.db.patch(sub._id, { currentPeriodEnd: args.currentPeriodEnd, updatedAt: Date.now() });
    }
  },
});

export const suspendSubscription = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_id", (q: any) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    if (sub) {
      await ctx.db.patch(sub._id, { status: "past_due", updatedAt: Date.now() });
    }
  },
});

export const deactivateSubscription = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_id", (q: any) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    if (sub) {
      await ctx.db.patch(sub._id, { status: "canceled", updatedAt: Date.now() });
    }
  },
});

export const updateSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    planId: v.optional(v.string()),
    billingCycle: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_id", (q: any) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    if (sub) {
      const updates: any = { updatedAt: Date.now() };
      if (args.status) updates.status = args.status;
      if (args.currentPeriodEnd) updates.currentPeriodEnd = args.currentPeriodEnd;
      if (args.cancelAtPeriodEnd !== undefined) updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
      if (args.planId) updates.planId = args.planId;
      if (args.billingCycle) updates.billingCycle = args.billingCycle;
      await ctx.db.patch(sub._id, updates);
    }
  },
});

export const getUserSubscription = query({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
    if (!sub) return null;

    const plan = await ctx.db.query("subscriptionPlans").withIndex("by_name", (q: any) => q.eq("name", sub.planId)).first();
    return { ...sub, plan };
  },
});

export const getSubscriptionPlans = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("subscriptionPlans").withIndex("by_active", (q: any) => q.eq("isActive", true)).collect();
  },
});

export const createSubscriptionPlan = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    priceMonthly: v.float64(),
    priceYearly: v.float64(),
    stripePriceIdMonthly: v.optional(v.string()),
    stripePriceIdYearly: v.optional(v.string()),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("subscriptionPlans", {
      name: args.name,
      description: args.description,
      features: args.features,
      priceMonthly: args.priceMonthly,
      priceYearly: args.priceYearly,
      apiCallsPerMonth: undefined,
      wsConnectionsAllowed: undefined,
      alertsAllowed: undefined,
      watchlistsAllowed: undefined,
      isActive: true,
      stripePriceIdMonthly: args.stripePriceIdMonthly,
      stripePriceIdYearly: args.stripePriceIdYearly,
      supabasePlanId: `plan_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getEntitlement = query({
  args: { userId: v.string(), featureName: v.string() },
  async handler(ctx, args) {
    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
    if (!sub || sub.status !== "active") return { access: false, reason: "No active subscription" };
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < Date.now()) return { access: false, reason: "Subscription expired" };

    const plan = await ctx.db.query("subscriptionPlans").withIndex("by_name", (q: any) => q.eq("name", sub.planId)).first();
    if (!plan) return { access: false, reason: "Plan not found" };

    const hasFeature = plan.features.includes(args.featureName) || plan.name === "admin";
    return { access: hasFeature, plan: plan.name, features: plan.features };
  },
});