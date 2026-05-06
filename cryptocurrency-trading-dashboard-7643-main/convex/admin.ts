import { query } from "./_generated/server";

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("userSubscriptions").collect();
    const plans = await ctx.db.query("subscriptionPlans").collect();

    const planMap = new Map(plans.map((p) => [p.supabasePlanId, p]));

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active"
    );
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = planMap.get(sub.planId);
      return sum + (plan?.priceMonthly ?? 0);
    }, 0);

    const premiumUsers = activeSubscriptions.filter((s) => {
      const plan = planMap.get(s.planId);
      return plan?.name === "Premium";
    }).length;

    const vipUsers = activeSubscriptions.filter((s) => {
      const plan = planMap.get(s.planId);
      return plan?.name === "VIP";
    }).length;

    return {
      totalUsers: users.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlyRevenue,
      freeUsers: users.length - activeSubscriptions.length,
      premiumUsers,
      vipUsers,
    };
  },
});

export const recentTransactions = query({
  args: {},
  handler: async (ctx) => {
    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_status")
      .order("desc")
      .take(5);
    return txns;
  },
});

export const recentUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").take(10);
    return users.map((u) => ({
      userId: u._id,
      email: u.email,
      createdAt: u.createdAt,
      subscriptionStatus: "none",
      subscriptionTier: "Free",
      roles: [] as string[],
    }));
  },
});
