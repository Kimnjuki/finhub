// convex/seeds/alertTemplates.ts
// Seed data for pre-built alert condition templates

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const seedAlertTemplates = mutation({
  handler: async (ctx) => {
    const templates = [
      {
        templateId: "funding_rate_above_0_1",
        name: "BTC Funding Rate Above 0.1%",
        description: "Alert when BTC perpetual funding rate exceeds 0.1% — signals potential long squeeze",
        alertType: "funding_change",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "fundingRate",
            operator: "gt",
            value: 0.001,
          }],
        }),
        requiredAccessLevel: "free",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "volume_spike_3x",
        name: "Volume Spike 3x Average",
        description: "Alert when 1h volume exceeds 3x the 24h average volume",
        alertType: "volume_spike",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "volumeSpike",
            operator: "gt",
            value: 3.0,
          }],
        }),
        requiredAccessLevel: "free",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "rsi_oversold_30",
        name: "RSI Oversold Below 30",
        description: "Alert when RSI drops below 30 — potential reversal signal",
        alertType: "price_below",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "rsi",
            operator: "lt",
            value: 30,
          }],
        }),
        requiredAccessLevel: "free",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "rsi_overbought_70",
        name: "RSI Overbought Above 70",
        description: "Alert when RSI rises above 70 — potential reversal signal",
        alertType: "price_above",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "rsi",
            operator: "gt",
            value: 70,
          }],
        }),
        requiredAccessLevel: "free",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "whale_trade_1m",
        name: "Whale Trade > $1M",
        description: "Alert when a single trade exceeds $1M notional value",
        alertType: "whale_trade",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "notionalValue",
            operator: "gt",
            value: 1000000,
          }],
        }),
        requiredAccessLevel: "premium",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "liquidation_cluster",
        name: "Liquidation Cluster Detected",
        description: "Alert when large liquidation cluster forms near current price",
        alertType: "liquidation_cluster",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "clusterValue",
            operator: "gt",
            value: 5000000,
          }],
        }),
        requiredAccessLevel: "premium",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "price_breakout_24h_high",
        name: "Price Breakout Above 24h High",
        description: "Alert when price breaks above the 24-hour high with volume confirmation",
        alertType: "price_above",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "price",
            operator: "gt",
            value: 0,
            secondaryValue: 1,
          }],
        }),
        requiredAccessLevel: "free",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "oi_spike_20pct",
        name: "Open Interest Spike > 20%",
        description: "Alert when open interest increases more than 20% in one hour",
        alertType: "oi_change",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "oiChangePercent",
            operator: "gt",
            value: 20,
          }],
        }),
        requiredAccessLevel: "basic",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "funding_rate_negative",
        name: "Funding Rate Negative > -0.05%",
        description: "Alert when funding rate drops below -0.05% — shorts paying heavily",
        alertType: "funding_change",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "fundingRate",
            operator: "lt",
            value: -0.0005,
          }],
        }),
        requiredAccessLevel: "basic",
        usageCount: 0,
        isActive: true,
      },
      {
        templateId: "cross_exchange_divergence",
        name: "Cross-Exchange Price Divergence > 2%",
        description: "Alert when price differs by more than 2% between exchanges",
        alertType: "spread_widening",
        conditionConfig: JSON.stringify({
          rules: [{
            field: "spreadPct",
            operator: "gt",
            value: 2.0,
          }],
        }),
        requiredAccessLevel: "premium",
        usageCount: 0,
        isActive: true,
      },
    ];

    let created = 0;
    for (const template of templates) {
      // Check if template already exists
      const existing = await ctx.db
        .query("alertTemplates")
        .withIndex("by_alert_type", (q: any) => q.eq("alertType", template.alertType))
        .first();

      if (!existing) {
        await ctx.db.insert("alertTemplates", template);
        created++;
      }
    }

    return { success: true, templatesCreated: created, total: templates.length };
  },
});