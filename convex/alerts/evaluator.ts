/// <reference path="../../src/types.d.ts" />

import { defineAction, action } from "convex/server";
import { v } from "convex/values";
import { evaluatePriceAbove, evaluatePriceBelow, evaluatePricePctChange } from "./conditions";

// Get all active alerts for a given instrument
export const getActiveAlerts = action({
  async handler(ctx, { instrumentId }: { instrumentId: string }) {
    return ctx.db.query("alerts").withIndex("by_instrument", (q) => q.eq("instrumentId", instrumentId)).filter((q) => q.eq("isActive", true)).collect();
  },
});

// Evaluate all alerts for an instrument
export const evaluateInstrumentAlerts = action({
  async handler(ctx, { instrumentId, price, volume, fundingRate, openInterest, timestamp }: { instrumentId: string; price?: number; volume?: number; fundingRate?: number; openInterest?: number; timestamp?: number }) {
    const alerts = await ctx.db.query("alerts")
      .withIndex("by_instrument", (q) => q.eq("instrumentId", instrumentId))
      .filter((q) => q.eq("isActive", true))
      .collect();

    let triggeredCount = 0;

    for (const alert of alerts) {
      // Check cooldown
      if (alert.lastTriggeredAt && alert.cooldownSeconds) {
        const now = timestamp || Date.now();
        if (now - alert.lastTriggeredAt < alert.cooldownSeconds * 1000) {
          continue; // Skip due to cooldown
        }
      }

      let conditionMet = false;

      // Evaluate based on alert type
      if (alert.type === "price_above") {
        const result = await evaluatePriceAbove(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
        conditionMet = result.met;
      } else if (alert.type === "price_below") {
        const result = await evaluatePriceBelow(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
        conditionMet = result.met;
      } else if (alert.type === "price_pct_change") {
        const result = await evaluatePricePctChange(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
        conditionMet = result.met;
      }
      // Add more condition types as needed

      if (conditionMet) {
        // Dispatch the alert
        await ctx.db.insert("alertDeliveries", {
          alertId: alert._id,
          userId: alert.userId,
          channel: alert.deliveryChannels[0] || "in_app",
          payload: JSON.stringify({ 
            message: `Alert triggered for ${alert.instrumentId}: ${alert.type}`, 
            alertId: alert._id,
            instrumentId: alert.instrumentId,
            type: alert.type,
            timestamp: timestamp || Date.now(),
          }),
          status: "pending",
          createdAt: timestamp || Date.now(),
        });
        
        // Update alert's last triggered time
        await ctx.db.patch(alert._id, { lastTriggeredAt: timestamp || Date.now() });
        triggeredCount++;
      }
    }

    return { triggeredCount };
  },
});

// Evaluate a single alert (can be called manually)
export const evaluateAlert = action({
  async handler(ctx, { alertId }: { alertId: string }) {
    const alert = await ctx.db.get(alertId);
    if (!alert || !alert.isActive) {
      return { triggered: false };
    }

    // Get latest market data for the instrument
    const latestTick = await ctx.db.query("tickData")
      .withIndex("by_instrument_ts", q => q.eq("instrumentId", alert.instrumentId))
      .order("desc")
      .take(1)
      .first();

    if (!latestTick) {
      return { triggered: false };
    }

    let conditionMet = false;

    if (alert.type === "price_above") {
      const result = await evaluatePriceAbove(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
      conditionMet = result.met;
    } else if (alert.type === "price_below") {
      const result = await evaluatePriceBelow(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
      conditionMet = result.met;
    } else if (alert.type === "price_pct_change") {
      const result = await evaluatePricePctChange(ctx, { alertId: alert._id, conditionConfig: alert.conditionConfig });
      conditionMet = result.met;
    }
    // Add more condition types

    if (conditionMet) {
      // Dispatch the alert
      await ctx.db.insert("alertDeliveries", {
        alertId,
        userId: alert.userId,
        channel: alert.deliveryChannels[0] || "in_app",
        payload: JSON.stringify({ 
          message: `Alert triggered for ${alert.instrumentId}: ${alert.type}`, 
          alertId,
          instrumentId: alert.instrumentId,
          type: alert.type,
          timestamp: Date.now(),
        }),
        status: "pending",
        createdAt: Date.now(),
      });
      // Update alert's last triggered time
      await ctx.db.patch(alertId, { lastTriggeredAt: Date.now() });
      return { triggered: true };
    }

    return { triggered: false };
  },
});
