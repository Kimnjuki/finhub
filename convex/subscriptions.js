import { mutation } from "convex/server";
import { v } from "convex/values";
export const subscribeToInstruments = mutation({
    args: {
        userId: v.string(),
        symbols: v.array(v.string()),
    },
    async handler(ctx, { userId, symbols }) {
        // Update or create user's data entitlements for the subscribed symbols
        // For simplicity, we'll upsert a record in a table that tracks user's market subscriptions
        // This could be a new table or using dataEntitlements
        // For now, we'll just log and return the symbols
        console.log(`Subscribing ${userId} to ${symbols.join(',')}`);
        // In a real implementation, you'd insert/update records in a userSubscriptions or dataEntitlements table
        return symbols;
    },
});
export const unsubscribeFromInstruments = mutation({
    args: {
        userId: v.string(),
        symbols: v.array(v.string()),
    },
    async handler(ctx, { userId, symbols }) {
        console.log(`Unsubscribing ${userId} from ${symbols.join(',')}`);
        return symbols;
    },
});
