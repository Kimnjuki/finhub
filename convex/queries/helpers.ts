import * as convex from "convex";

// Existing queries...
export const getUserByEmail = convex.defineQuery({
  async handler(ctx, { email }) {
    return ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
  },
});

export const listActivePlans = convex.defineQuery({
  async handler(ctx) {
    return ctx.db.query("subscriptionPlans").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
  },
});

export const getUserSubscription = convex.defineQuery({
  async handler(ctx, { userId }) {
    const sub = await ctx.db.query("userSubscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).filter((q) => q.eq(q.field("status"), "active")).first();
    if (!sub) return null;
    const plan = await ctx.db.query("subscriptionPlans").withIndex("by_name").filter((q) => q.eq(q.field("name"), sub.planId)).first();
    return { subscription: sub, plan };
  },
});

export const listUpcomingEvents = convex.defineQuery({
  async handler(ctx, { category, limit }) {
    const now = Date.now();
    let results;
    if (category) {
      results = await ctx.db.query("events").withIndex("by_category", (q) => q.eq("category", category)).filter((q) => q.gt(q.field("startTsUtc"), now)).take(limit ?? 50);
    } else {
      results = await ctx.db.query("events").withIndex("by_start_ts", (q) => q.gt("startTsUtc", now)).take(limit ?? 50);
    }
    return results.sort((a, b) => a.startTsUtc - b.startTsUtc);
  },
});

export const getUserRoles = convex.defineQuery({
  async handler(ctx, { userId }) {
    const userRoles = await ctx.db.query("userRoles").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    return userRoles.map((ur) => ur.roleName);
  },
});

export const assignRole = convex.defineMutation({
  async handler(ctx, { userId, roleName }) {
    const existing = await ctx.db.query("userRoles").withIndex("by_user_and_role", (q) =>
      q.eq("userId", userId).eq("roleName", roleName)
    ).first();
    if (existing) return existing._id;
    return ctx.db.insert("userRoles", {
      userId,
      roleName,
      assignedAt: Date.now(),
    });
  },
});

// New market queries
export const queryMarketInstruments = convex.defineQuery({
  async handler(ctx) {
    return ctx.db.query("marketInstruments").collect();
  },
});

export const queryMarketStreams = convex.defineQuery({
  async handler(ctx) {
    return ctx.db.query("marketStreams").withIndex("by_status", (q) => q.eq("status", "active")).collect();
  },
});

export const streamMarketData = convex.defineAction({
  async handler(ctx, args) {
    const { sourceId, instrumentId, channel, payload } = args;
    // Insert into streamMessages or update streamSnapshots
    // For now, just log
    console.log(`Stream data: ${sourceId} ${instrumentId} ${channel}`, payload);
    return { success: true };
  },
});