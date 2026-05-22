import { action } from "convex/server";

export const deduplicateAlerts = action({
  async handler(ctx, { alertId, triggerValue }: { alertId: string; triggerValue: string }) {
    // Hash the alertId + triggerValue + windowKey to create a unique identifier
    const hash = `${alertId}:${triggerValue}`;
    const now = Date.now();

    // Check if we've seen this same alert recently (within 5 minutes)
    const recent = await ctx.db.query("alertDedup")
      .filter(q => q.eq("hash", hash))
      .filter(q => q.gt("expiresAt", now))
      .first();

    if (recent) {
      return { shouldDispatch: false };
    }

    // If not seen recently, create a new dedup entry
    await ctx.db.insert("alertDedup", {
      hash,
      alertId,
      triggerValue,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes
      createdAt: now,
    });

    return { shouldDispatch: true };
  },
});