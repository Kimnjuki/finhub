import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
// Seed subscription plans (call this once after schema deployment)
export const seedPlans = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        // Check if plans already exist
        const existingPlans = await ctx.db.query("subscriptionPlans").first();
        if (existingPlans)
            return { seeded: false, reason: "Plans already exist" };
        // Free Plan
        await ctx.db.insert("subscriptionPlans", {
            name: "Free",
            description: "Basic access to delayed market data",
            features: [
                "Delayed data (15min delay)",
                "2 alerts",
                "1 watchlist",
                "Basic events calendar",
                "No API access",
            ],
            priceMonthly: 0,
            priceYearly: 0,
            alertsAllowed: 2,
            watchlistsAllowed: 1,
            wsConnectionsAllowed: 1,
            isActive: true,
            supabasePlanId: "plan_free",
            createdAt: now,
            updatedAt: now,
        });
        // Trader Plan
        await ctx.db.insert("subscriptionPlans", {
            name: "Trader",
            description: "Real-time data for active traders",
            features: [
                "Real-time Binance + Coinbase + Kraken",
                "L1 order book",
                "10 alerts",
                "5 watchlists",
                "Signal feed access",
                "Basic API (500 req/min)",
            ],
            priceMonthly: 29,
            priceYearly: 249,
            alertsAllowed: 10,
            watchlistsAllowed: 5,
            wsConnectionsAllowed: 5,
            apiCallsPerMonth: 500,
            isActive: true,
            stripePriceIdMonthly: "price_trader_monthly",
            stripePriceIdYearly: "price_trader_yearly",
            supabasePlanId: "plan_trader",
            createdAt: now,
            updatedAt: now,
        });
        // Pro Plan
        await ctx.db.insert("subscriptionPlans", {
            name: "Pro",
            description: "Full market intelligence for serious traders",
            features: [
                "All exchanges (Binance, Coinbase, Kraken, Bybit, OKX)",
                "L2 order book depth",
                "Funding rates + OI + Liquidations",
                "100 alerts",
                "Unlimited watchlists",
                "Onchain metrics",
                "Advanced AI signals",
                "Full API (2000 req/min)",
            ],
            priceMonthly: 79,
            priceYearly: 699,
            alertsAllowed: 100,
            watchlistsAllowed: -1, // unlimited
            wsConnectionsAllowed: 25,
            apiCallsPerMonth: 2000,
            isActive: true,
            stripePriceIdMonthly: "price_pro_monthly",
            stripePriceIdYearly: "price_pro_yearly",
            supabasePlanId: "plan_pro",
            createdAt: now,
            updatedAt: now,
        });
        // Enterprise Plan
        await ctx.db.insert("subscriptionPlans", {
            name: "Enterprise",
            description: "Custom solution for institutions and fintechs",
            features: [
                "All data sources including custom feeds",
                "L3 order book",
                "Dedicated WebSocket stream",
                "White-label option available",
                "SLA 99.9% uptime guarantee",
                "Unlimited API calls",
                "Custom data sources",
                "African/EM market priority",
                "Dedicated support engineer",
            ],
            priceMonthly: 0, // custom pricing
            priceYearly: 0,
            alertsAllowed: -1,
            watchlistsAllowed: -1,
            wsConnectionsAllowed: -1,
            apiCallsPerMonth: -1,
            isActive: true,
            supabasePlanId: "plan_enterprise",
            createdAt: now,
            updatedAt: now,
        });
        // Seed subscription features
        const features = [
            { name: "real_time_data", description: "Access to real-time market data" },
            { name: "order_book_l1", description: "Level 1 order book data" },
            { name: "order_book_l2", description: "Level 2 order book depth" },
            { name: "order_book_l3", description: "Level 3 full order book" },
            { name: "funding_rates", description: "Funding rate data" },
            { name: "open_interest", description: "Open interest data" },
            { name: "liquidations", description: "Liquidation data" },
            { name: "onchain_metrics", description: "On-chain metrics" },
            { name: "ai_signals", description: "AI-powered trading signals" },
            { name: "api_access", description: "REST API access" },
            { name: "webhook_alerts", description: "Webhook alert delivery" },
            { name: "white_label", description: "White-label branding" },
        ];
        for (const feature of features) {
            await ctx.db.insert("subscriptionFeatures", {
                featureName: feature.name,
                description: feature.description,
                supabaseFeatureId: `feat_${feature.name}`,
            });
        }
        return { seeded: true, reason: "All plans and features seeded successfully" };
    },
});
// Get all available plans
export const getPlans = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("subscriptionPlans")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});
// Get user's current subscription
export const getUserSubscription = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const sub = await ctx.db
            .query("userSubscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
        if (!sub)
            return null;
        const plan = await ctx.db.query("subscriptionPlans")
            .withIndex("by_name", (q) => q.eq("name", sub.planId === "free" ? "Free" : sub.planId))
            .first();
        return {
            ...sub,
            plan,
        };
    },
});
// Subscribe to a plan
export const subscribeToPlan = mutation({
    args: {
        userId: v.string(),
        planName: v.string(),
        billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    },
    handler: async (ctx, args) => {
        const { userId, planName, billingCycle } = args;
        const now = Date.now();
        // Find the plan
        const plan = await ctx.db
            .query("subscriptionPlans")
            .withIndex("by_name", (q) => q.eq("name", planName))
            .first();
        if (!plan)
            throw new Error(`Plan ${planName} not found`);
        // Cancel existing subscription if any
        const existingSub = await ctx.db
            .query("userSubscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
        if (existingSub) {
            await ctx.db.patch(existingSub._id, { status: "canceled", updatedAt: now });
        }
        const periodEnd = billingCycle === "monthly"
            ? now + 30 * 24 * 60 * 60 * 1000
            : now + 365 * 24 * 60 * 60 * 1000;
        const subId = await ctx.db.insert("userSubscriptions", {
            userId,
            planId: planName.toLowerCase(),
            status: "active",
            billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            supabaseId: `sub_${userId}_${now}`,
            createdAt: now,
            updatedAt: now,
        });
        return { subscriptionId: subId, plan: planName };
    },
});
// Get user's entitlements
export const getUserEntitlements = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const features = await ctx.db
            .query("featureAccess")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        const dataEntitlements = await ctx.db
            .query("dataEntitlements")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        const subscription = await ctx.db
            .query("userSubscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
        return {
            features,
            dataEntitlements,
            subscription,
        };
    },
});
