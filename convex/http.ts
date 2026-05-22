import { action } from "convex/server";
import { v } from "convex/values";

// Middleware to validate API keys for HTTP actions
export const validateApiKey = action({
  async handler(ctx: any, { req }: { req: any }) {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { valid: false, reason: "Missing or malformed Authorization header" };
    }

    const apiKey = authHeader.substring(7); // remove "Bearer " prefix

    // Check if the API key exists and is active
    const key = await ctx.db.get("apiKeys", apiKey);
    if (!key || !key.isActive) {
      return { valid: false, reason: "Invalid or inactive API key" };
    }

    // Check expiration
    if (key.expiresAt && key.expiresAt < Date.now()) {
      return { valid: false, reason: "API key expired" };
    }

    // Check rate limits (simplified)
    const rateLimitKey = `${key.userId}:api:${key._id}`;
let rateLimitCount = await ctx.db.get("rateLimits", rateLimitKey) || { count: 0 };
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute window
    const windowStart = Math.floor(now / windowSize) * windowSize;

    if (rateLimitCount.count && rateLimitCount.windowStart === windowStart && rateLimitCount.count >= 100) {
      return { valid: false, reason: "Rate limit exceeded" };
    }

    // Update rate limit count
    if (rateLimitCount.windowStart === windowStart) {
      rateLimitCount.count++;
    } else {
      rateLimitCount = { windowKey: `${key.userId}:api:${key._id}:${windowStart}`, count: 1, windowStartAt: now };
    }

    await ctx.db.insert("rateLimits", rateLimitCount);

    return { valid: true, userId: key.userId, scopes: key.scopes || [] };
  },
});

// Middleware to check entitlements for API endpoints
export const checkEndpointEntitlements = action({
  async handler({ userId, endpoint }: { userId: string; endpoint: string }) {
    // This would check the user's access level for the specific endpoint
    // For now, we'll just return allowed
    return { allowed: true };
  },
});
