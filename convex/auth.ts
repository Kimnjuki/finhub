import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const signUp = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    if (existing) throw new Error("already registered");

    const passwordHash = await hashPassword(password);
    const now = Date.now();
    
    // Generate a unique supabaseUserId (since we're not using Supabase directly)
    const supabaseUserId = `convex_${now}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      signInMethod: "email",
      supabaseUserId,
      isVerified: false,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create default free-tier data entitlements for the new user
    await ctx.db.insert("dataEntitlements", {
      userId: userId as unknown as string,
      sourceId: "free_default",
      channel: "ticker",
      accessLevel: "free",
      grantedAt: now,
    });

    await ctx.db.insert("userSubscriptions", {
      userId: userId as unknown as string,
      planId: "free",
      status: "active",
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: now + 365 * 24 * 60 * 60 * 1000, // 1 year for free
      supabaseId: supabaseUserId + "_sub",
      createdAt: now,
      updatedAt: now,
    });

    return { userId, email };
  },
});

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }: { email: string; password: string }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    if (!user) throw new Error("Invalid login credentials");

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash)
      throw new Error("Invalid login credentials");

    // Update last active timestamp
    await ctx.db.patch(user._id, { 
      lastActiveAt: Date.now(), 
      updatedAt: Date.now() 
    });

    return { 
      userId: user._id, 
      email: user.email, 
      isVerified: user.isVerified,
      displayName: user.displayName,
    };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      displayName: user.displayName,
      supabaseUserId: user.supabaseUserId,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    };
  },
});

export const updatePassword = mutation({
  args: { userId: v.id("users"), newPassword: v.string() },
  handler: async (ctx: any, { userId, newPassword }: { userId: any; newPassword: string }) => {
    const passwordHash = await hashPassword(newPassword);
    await ctx.db.patch(userId, { passwordHash, updatedAt: Date.now() });
  },
});

export const checkSession = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      displayName: user.displayName,
    };
  },
});