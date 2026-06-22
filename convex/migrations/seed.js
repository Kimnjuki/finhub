import { internalMutation } from "../_generated/server";
export const run = internalMutation({
    args: {},
    handler: async (ctx) => {
        // 1. Roles
        const roleNames = ["admin", "analyst", "vip_user", "user"];
        for (const roleName of roleNames) {
            const existing = await ctx.db
                .query("roles")
                .withIndex("by_role_name", (q) => q.eq("roleName", roleName))
                .first();
            if (!existing) {
                await ctx.db.insert("roles", { roleName });
            }
        }
        // 2. Subscription Plans
        const plans = [
            {
                planId: "6fd5c854-c8e0-4f35-96d0-6d672b86ca9a",
                name: "Free",
                description: "Perfect for beginners exploring financial markets",
                priceMonthly: 0,
                priceYearly: 0,
                features: [
                    "Smart Currency Calculator",
                    "Basic Market News",
                    "Educational Resources",
                    "FAQ Access",
                    "Community Support",
                    "Limited Market Data (1 day delay)",
                    "Basic Portfolio Tracking (1 portfolio)",
                ],
                isActive: true,
                createdAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
                updatedAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
            },
            {
                planId: "a24602b8-08b1-46b0-8953-5b893b58fe19",
                name: "Premium",
                description: "Advanced tools for serious traders and investors",
                priceMonthly: 29,
                priceYearly: 290,
                features: [
                    "Everything in Free",
                    "Real-time Market Data",
                    "Advanced Technical Analysis",
                    "Portfolio Analytics Dashboard",
                    "Risk Management Tools",
                    "Social Trading Signals",
                    "Market Sentiment Analysis",
                    "Up to 10 Portfolio Tracking",
                    "Email Alerts & Notifications",
                    "Advanced Charting Tools",
                    "Historical Data (5 years)",
                    "Priority Email Support",
                ],
                isActive: true,
                createdAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
                updatedAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
            },
            {
                planId: "242c3426-7638-4ddf-99ba-62b29c265f32",
                name: "VIP",
                description: "Professional-grade platform for expert traders",
                priceMonthly: 99,
                priceYearly: 990,
                features: [
                    "Everything in Premium",
                    "AI-Powered Trading Insights",
                    "Unlimited Portfolio Tracking",
                    "Advanced API Access",
                    "Custom Technical Indicators",
                    "Institutional-Grade Research",
                    "1-on-1 Strategy Consultation",
                    "White-label Solutions",
                    "Priority Phone Support",
                    "Dedicated Account Manager",
                    "Custom Market Reports",
                    "Advanced Risk Analytics",
                    "Multi-exchange Integration",
                    "Historical Data (20+ years)",
                ],
                isActive: true,
                createdAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
                updatedAt: new Date("2025-08-11T12:55:02.735Z").getTime(),
            },
        ];
        for (const plan of plans) {
            const existing = await ctx.db
                .query("subscriptionPlans")
                .withIndex("by_name", (q) => q.eq("name", plan.name))
                .first();
            if (!existing) {
                await ctx.db.insert("subscriptionPlans", plan);
            }
        }
        console.log("Seed complete: roles and subscription plans inserted.");
    },
});
