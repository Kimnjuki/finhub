import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) throw new Error("already registered");

    const passwordHash = await hashPassword(password);
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      signInMethod: "email",
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });
    return { userId, email };
  },
});

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!user) throw new Error("Invalid login credentials");

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash)
      throw new Error("Invalid login credentials");

    return { userId: user._id, email: user.email, isVerified: user.isVerified };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db.get(userId);
  },
});

export const updatePassword = mutation({
  args: { userId: v.id("users"), newPassword: v.string() },
  handler: async (ctx, { userId, newPassword }) => {
    const passwordHash = await hashPassword(newPassword);
    await ctx.db.patch(userId, { passwordHash, updatedAt: Date.now() });
  },
});
