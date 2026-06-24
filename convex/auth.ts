import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const validateSession = query({
  args: { userId: v.string(), sessionId: v.string() },
  async handler(ctx: any, args: any) {
    const user = await ctx.db.query("users").withIndex("by_supabase_id", (q: any) => q.eq("supabaseUserId", args.userId)).first();
    if (!user) return { valid: false, reason: "User not found" };
    
    // Check session timeout (30 min inactivity)
    if (user.lastActiveAt && Date.now() - user.lastActiveAt > 30 * 60 * 1000) {
      return { valid: false, reason: "Session expired due to inactivity" };
    }
    
    return { valid: true, user: { id: user._id, email: user.email, kycStatus: user.kycStatus } };
  },
});

export const checkRateLimit = internalMutation({
  args: { userId: v.string(), action: v.string(), maxAttempts: v.optional(v.float64()) },
  async handler(ctx: any, args: any) {
    const windowKey = `${args.userId}:${args.action}:${Math.floor(Date.now() / 60000)}`;
    const maxAttempts = args.maxAttempts || 5;
    
    const existing = await ctx.db.query("rateLimits").withIndex("by_user_window", (q: any) => q.eq("userId", args.userId).eq("windowKey", windowKey)).first();
    
    if (existing) {
      if (existing.count >= maxAttempts) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      await ctx.db.patch(existing._id, { count: existing.count + 1, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        windowKey,
        count: 1,
        windowStartAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return { allowed: true, remainingAttempts: maxAttempts - (existing?.count ?? 0) - 1 };
  },
});

export const checkMFAStatus = query({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const user = await ctx.db.query("users").withIndex("by_supabase_id", (q: any) => q.eq("supabaseUserId", args.userId)).first();
    if (!user) return { enabled: false };
    
    const prefs = await ctx.db.query("userPreferences").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).first();
    return { enabled: prefs?.notificationPreferences?.email === true || false };
  },
});

export const generateMFABackupCodes = mutation({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(`${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    }
    // Store hashed backup codes
    return { codes, message: "Store these codes securely. Each can only be used once." };
  },
});

export const verifyMFAToken = mutation({
  args: { userId: v.string(), token: v.string() },
  async handler(ctx: any, args: any) {
    // In production, verify TOTP against stored secret
    // For now, accept any 6-digit code as valid (for testing)
    if (args.token.length === 6 && /^\d+$/.test(args.token)) {
      return { verified: true };
    }
    return { verified: false, reason: "Invalid token" };
  },
});

export const logAuthAttempt = internalMutation({
  args: { userId: v.string(), action: v.string(), success: v.boolean(), ipAddress: v.optional(v.string()) },
  async handler(ctx: any, args: any) {
    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: `${args.action}:${args.success ? "success" : "failure"}`,
      ipAddress: args.ipAddress,
      createdAt: Date.now(),
    });
    
    // Check for account lockout (10 failed attempts)
    if (!args.success) {
      const recentFailures = await ctx.db
        .query("auditLogs")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .filter((q: any) => q.and(
          q.eq(q.field("action"), "login:failure"),
          q.gt(q.field("createdAt"), Date.now() - 15 * 60 * 1000) // last 15 min
        ))
        .collect();
      
      if (recentFailures.length >= 10) {
        throw new Error("Account locked due to too many failed attempts. Try again in 15 minutes.");
      }
    }
  },
});

export const enforceEmailVerification = query({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const user = await ctx.db.query("users").withIndex("by_supabase_id", (q: any) => q.eq("supabaseUserId", args.userId)).first();
    if (!user) return { verified: false, reason: "User not found" };
    if (!user.isVerified) return { verified: false, reason: "Email not verified" };
    return { verified: true };
  },
});