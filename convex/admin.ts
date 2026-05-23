import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const dashboardStats = query({
  args: {},
  handler: async (ctx: any) => {
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("userSubscriptions").collect();
    const plans = await ctx.db.query("subscriptionPlans").collect();

const planMap = new Map<string, Doc<"subscriptionPlans">>();
plans.forEach((p: any) => planMap.set(p._id, p));

const activeSubscriptions = subscriptions.filter(
  (s: any) => s.status === "active"
);
const monthlyRevenue = activeSubscriptions.reduce((sum: any, sub: any) => {
  const plan = planMap.get(sub.planId as Id<"subscriptionPlans">);
  return sum + (plan?.priceMonthly ?? 0);
}, 0);

const premiumUsers = activeSubscriptions.filter((s: any) => {
  const plan = planMap.get(s.planId as Id<"subscriptionPlans">);
  return plan?.name === "Premium";
}).length;

const vipUsers = activeSubscriptions.filter((s: any) => {
  const plan = planMap.get(s.planId as Id<"subscriptionPlans">);
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
  handler: async (ctx: any) => {
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
  handler: async (ctx: any) => {
    const users = await ctx.db.query("users").order("desc").take(10);
return users.map((u: any) => ({
  userId: u._id,
  email: u.email,
  createdAt: u.createdAt,
  subscriptionStatus: "none",
  subscriptionTier: "Free",
  roles: [] as string[],
}));
  },
});