import { defineAction, action } from "convex/server";
import { query, defineQuery } from "convex/server";
import { v } from "convex/values";

// Create a new alert
export const createAlert = action({
  async handler(ctx, { 
    userId, 
    instrumentId, 
    type, 
    conditionConfig, 
    deliveryChannels,
    cooldownSeconds,
    expiresAt 
  }: { 
    userId: string;
    instrumentId: string;
    type: string;
    conditionConfig: string;
    deliveryChannels: string[];
    cooldownSeconds?: number;
    expiresAt?: number;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    // Verify user owns the instrument or has permission
    const access = await checkAccess(ctx, identity.subject, "alerts");
    if (!access.allowed) throw new Error(access.reason);

    const alert = await ctx.db.insert("alerts", {
      userId,
      instrumentId,
      type,
      conditionConfig: JSON.stringify(conditionConfig),
      deliveryChannels,
      cooldownSeconds,
      expiresAt,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return alert;
  },
});

// Get alerts for a user
export const getAlerts = query({
  async handler(ctx, { 
    userId, 
    instrumentId, 
    limit = 50 
  }: { 
    userId: string; 
    instrumentId?: string;
    limit?: number;
  }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "alerts");
    if (!access.allowed) throw new Error(access.reason);

    let query = ctx.db.query("alerts").filter((q: any) => q.eq("userId", userId));

    if (instrumentId) {
      query = query.filter((q: any) => q.eq("instrumentId", instrumentId));
    }

    return query.order("createdAt", "desc").take(limit).collect();
  },
});

// Delete an alert
export const deleteAlert = action({
  async handler(ctx, { alertId }: { alertId: string }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const access = await checkAccess(ctx, identity.subject, "alerts");
    if (!access.allowed) throw new Error(access.reason);

    // Soft delete - set isActive to false
    await ctx.db.patch(alertId, { isActive: false, deletedAt: Date.now() });
    return { success: true };
  },
});

// Helper function for access control (will be implemented properly later)
async function checkAccess(ctx: any, userId: string, feature: string) {
  // This is a simplified version - in production, this would check user entitlements
  return { allowed: true, reason: "Access denied" };
}