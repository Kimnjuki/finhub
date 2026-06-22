import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getUsersWithRoles = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const userRoles = await ctx.db.query("userRoles").collect();
        const rolesByUser = new Map();
        for (const ur of userRoles) {
            const existing = rolesByUser.get(ur.userId) ?? [];
            existing.push(ur.roleName);
            rolesByUser.set(ur.userId, existing);
        }
        return users.map((u) => ({
            user_id: u._id,
            email: u.email,
            created_at: u.createdAt,
            is_verified: u.isVerified,
            subscription_tier_id: u.subscriptionTierId ?? null,
            roles: rolesByUser.get(u._id) ?? [],
        }));
    },
});
export const getUserRoles = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const roles = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        return roles.map((r) => r.roleName);
    },
});
export const assignRole = mutation({
    args: { userId: v.string(), roleName: v.string() },
    handler: async (ctx, { userId, roleName }) => {
        const existing = await ctx.db
            .query("userRoles")
            .withIndex("by_user_and_role", (q) => q.eq("userId", userId).eq("roleName", roleName))
            .first();
        if (existing)
            return existing._id;
        return ctx.db.insert("userRoles", {
            userId,
            roleName,
            assignedAt: Date.now(),
        });
    },
});
export const removeRole = mutation({
    args: { userId: v.string(), roleName: v.string() },
    handler: async (ctx, { userId, roleName }) => {
        const record = await ctx.db
            .query("userRoles")
            .withIndex("by_user_and_role", (q) => q.eq("userId", userId).eq("roleName", roleName))
            .first();
        if (record)
            await ctx.db.delete(record._id);
    },
});
