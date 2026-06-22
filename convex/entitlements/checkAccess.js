/// <reference path="../../src/types.d.ts" />
import { action } from "convex/server";
// Check if a user has access to a specific feature, data source, or channel
export const checkAccess = action({
    async handler(ctx, { userId, featureName, accessLevel }) {
        // Check featureAccess table
        const access = await ctx.db.query("featureAccess")
            .withIndex("by_user_and_feature", (q) => q.eq("userId", userId).eq("featureName", featureName))
            .first();
        if (!access) {
            // Check user's subscription plan entitlements
            const userSub = await ctx.db.get("userSubscriptions", userId); // This might need a query
            if (!userSub)
                return { allowed: false, reason: "No subscription" };
            // Check subscriptionFeatures and tierFeatureMap
            // For simplicity, we'll just check if the user has a valid subscription
            const now = Date.now();
            if (userSub.status !== "active" || userSub.currentPeriodEnd < now) {
                return { allowed: false, reason: "Inactive subscription" };
            }
            // Check if the feature is included in the plan
            // This would require querying subscriptionFeatures and tierFeatureMap
            // For now, return false
            return { allowed: false, reason: "Feature not included in plan" };
        }
        // Check if access has expired
        if (access.expiresAt && access.expiresAt < Date.now()) {
            return { allowed: false, reason: "Access expired" };
        }
        // Check access level
        if (access.accessLevel !== accessLevel) {
            return { allowed: false, reason: "Insufficient access level" };
        }
        return { allowed: true };
    },
});
// Check data entitlements for a user to access a specific source/channel
export const checkDataEntitlement = action({
    async handler(ctx, { userId, sourceId, channel, marketType }) {
        const entitlement = await ctx.db.query("dataEntitlements")
            .withIndex("by_user_and_source", (q) => q.eq("userId", userId).eq("sourceId", sourceId))
            .filter((q) => q.eq("channel", channel))
            .first();
        if (!entitlement) {
            return { allowed: false, reason: "No data entitlement" };
        }
        if (entitlement.expiresAt && entitlement.expiresAt < Date.now()) {
            return { allowed: false, reason: "Entitlement expired" };
        }
        if (entitlement.marketType && entitlement.marketType !== marketType) {
            return { allowed: false, reason: "Market type not allowed" };
        }
        return { allowed: true };
    },
});
