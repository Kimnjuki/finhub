import { action } from "convex/server";
export const dispatchAlert = action({
    async handler(ctx, { alertDeliveryId, channel, payload }) {
        // This would send the alert via the specified channel (email, SMS, push, etc.)
        // For now, we'll just mark it as sent
        await ctx.db.patch(alertDeliveryId, {
            status: "sent",
            sentAt: Date.now(),
        });
        return { success: true };
    },
});
// Background action to process the alert delivery queue
export const processAlertQueue = action({
    async handler(ctx) {
        // Get all pending alert deliveries
        const pending = await ctx.db.query("alertDeliveries")
            .filter((q) => q.eq("status", "pending"))
            .take(100) // limit to avoid overloading
            .collect();
        for (const delivery of pending) {
            try {
                // Dispatch based on channel
                await dispatchAlert(ctx, {
                    alertDeliveryId: delivery._id,
                    channel: delivery.channel,
                    payload: JSON.parse(delivery.payload),
                });
            }
            catch (error) {
                console.error("Failed to dispatch alert:", error);
                // Optionally mark as failed or retry later
            }
        }
    },
});
