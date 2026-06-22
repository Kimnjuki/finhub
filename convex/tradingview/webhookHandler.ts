import { action } from "convex/server";
import { v } from "convex/values";
import { ActionCtx } from "../_generated/server";
import { parseTradingViewAlert } from "./payloadParser";
import { mapAlertToOrder } from "./orderMapper";
import { executeOrder } from "./exchanges/executor";
import { checkRiskControls } from "./riskControls";

interface ProcessTradingViewAlertArgs {
  configId: string;
  userId: string;
  rawPayload: string;
  ipAddress?: string;
  userAgent?: string;
  signature?: string;
}

/**
 * Main entry point for processing a TradingView webhook alert.
 * This action is called by the HTTP endpoint after HMAC verification.
 */
export const processTradingViewAlert = action({
  args: {
    configId: v.string(),
    userId: v.string(),
    rawPayload: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    signature: v.optional(v.string()),
  },
  async handler(ctx: ActionCtx, args: ProcessTradingViewAlertArgs) {
    const { configId, userId, rawPayload } = args;
    const startTime = Date.now();

    // 1. Create the webhook event log entry
    const eventId = await ctx.db.insert("tvWebhookEvents", {
      configId,
      userId,
      rawPayload,
      hmacValid: true, // Already verified by HTTP endpoint
      signatureProvided: args.signature,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      processingStatus: "received",
      receivedAt: startTime,
    });

    try {
      // 2. Get config
      const config = await ctx.db.get(configId);
      if (!config || !config.isActive) {
        await ctx.db.patch(eventId, {
          processingStatus: "rejected",
          errorMessage: "Webhook config is inactive or not found",
          processedAt: Date.now(),
        });
        return { success: false, error: "Config inactive or not found" };
      }

      // 3. Parse the TradingView alert payload
      const parsed = parseTradingViewAlert(rawPayload);
      if (!parsed.success) {
        await ctx.db.patch(eventId, {
          processingStatus: "rejected",
          errorMessage: parsed.error || "Failed to parse alert payload",
          processedAt: Date.now(),
        });
        return { success: false, error: parsed.error };
      }

      // Update event with parsed fields
      const patchFields: Record<string, any> = {
        parsingStatus: "parsed",
        parsedSymbol: parsed.symbol,
        parsedSide: parsed.side,
        parsedQuantity: parsed.quantity,
        parsedPrice: parsed.price,
        parsedOrderType: parsed.orderType,
        parsedStrategyName: parsed.strategy,
      };

      // 4. Check for symbol mapping overrides
      let resolvedSymbol = parsed.symbol!;
      if (config.symbolMappings) {
        try {
          const mappings = JSON.parse(config.symbolMappings);
          if (mappings[resolvedSymbol]) {
            resolvedSymbol = mappings[resolvedSymbol];
          }
        } catch (e) {
          // Ignore malformed mappings
        }
      }

      // 5. Map alert to order parameters
      const orderParams = mapAlertToOrder(parsed, config, resolvedSymbol);
      if (!orderParams.success) {
        await ctx.db.patch(eventId, {
          ...patchFields,
          processingStatus: "rejected",
          errorMessage: orderParams.error || "Failed to map alert to order",
          processedAt: Date.now(),
        });
        return { success: false, error: orderParams.error };
      }

      await ctx.db.patch(eventId, {
        ...patchFields,
        processingStatus: "mapped",
      });

      // 6. Check risk controls
      const withinLimits = await checkRiskControls(ctx, userId, config, orderParams);
      if (!withinLimits.allowed) {
        await ctx.db.patch(eventId, {
          processingStatus: "rejected",
          errorMessage: withinLimits.reason || "Risk control check failed",
          parsedQuantity: orderParams.quantity,
          processedAt: Date.now(),
        });
        return { success: false, error: withinLimits.reason };
      }

      // 7. Resolve which exchange credentials to use
      const exchange = config.defaultExchange || "binance";
      const credentials = await ctx.db.query("exchangeCredentials")
        .withIndex("by_user_and_exchange", (q: any) => 
          q.eq("userId", userId).eq("exchange", exchange)
        )
        .filter((q: any) => q.eq("isActive", true))
        .first();

      if (!credentials) {
        await ctx.db.patch(eventId, {
          processingStatus: "order_failed",
          errorMessage: `No active credentials found for exchange: ${exchange}`,
          processedAt: Date.now(),
        });
        return { success: false, error: `No credentials for ${exchange}` };
      }

      // 8. Execute the order on the exchange
      const exchangeResult = await executeOrder(ctx, {
        credentialId: credentials._id,
        exchange,
        userId,
        symbol: resolvedSymbol,
        side: orderParams.side,
        orderType: orderParams.orderType,
        quantity: orderParams.quantity,
        price: orderParams.price,
        stopPrice: orderParams.stopPrice,
        limitPrice: orderParams.limitPrice,
        timeInForce: orderParams.timeInForce,
        leverage: orderParams.leverage,
        reduceOnly: orderParams.reduceOnly,
      });

      // 9. Record the order
      const orderId = await ctx.db.insert("tvOrders", {
        userId,
        configId,
        eventId,
        exchange,
        exchangeOrderId: exchangeResult.exchangeOrderId,
        credentialId: credentials._id,
        symbol: resolvedSymbol,
        side: orderParams.side as any,
        orderType: orderParams.orderType as any,
        quantity: orderParams.quantity,
        price: orderParams.price,
        stopPrice: orderParams.stopPrice,
        limitPrice: orderParams.limitPrice,
        timeInForce: orderParams.timeInForce as any,
        leverage: orderParams.leverage,
        status: exchangeResult.success ? "placed" : "rejected",
        filledQuantity: 0,
        placedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 10. Update event with order link
      const eventStatus = exchangeResult.success ? "order_placed" : "order_failed";
      await ctx.db.patch(eventId, {
        processingStatus: eventStatus,
        linkedOrderId: orderId,
        errorMessage: exchangeResult.error,
        processedAt: Date.now(),
      });

      // 11. Update config stats
      await ctx.db.patch(configId, {
        totalAlertsReceived: (config.totalAlertsReceived || 0) + 1,
        totalOrdersPlaced: exchangeResult.success ? (config.totalOrdersPlaced || 0) + 1 : (config.totalOrdersPlaced || 0),
        totalErrors: exchangeResult.success ? (config.totalErrors || 0) : (config.totalErrors || 0) + 1,
        lastAlertAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 12. Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const existingStats = await ctx.db.query("tvDailyStats")
        .withIndex("by_user_and_date", (q: any) =>
          q.eq("userId", userId).eq("date", today)
        )
        .first();

      if (existingStats) {
        await ctx.db.patch(existingStats._id, {
          orderCount: existingStats.orderCount + 1,
          totalVolume: existingStats.totalVolume + (orderParams.quantity * (orderParams.price || 0)),
          filledCount: existingStats.filledCount + (exchangeResult.success ? 1 : 0),
          rejectedCount: existingStats.rejectedCount + (exchangeResult.success ? 0 : 1),
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("tvDailyStats", {
          userId,
          date: today,
          orderCount: 1,
          totalVolume: orderParams.quantity * (orderParams.price || 0),
          totalFees: 0,
          filledCount: exchangeResult.success ? 1 : 0,
          rejectedCount: exchangeResult.success ? 0 : 1,
          updatedAt: Date.now(),
        });
      }

      return {
        success: exchangeResult.success,
        orderId,
        exchangeOrderId: exchangeResult.exchangeOrderId,
        eventId,
        symbol: resolvedSymbol,
        side: orderParams.side,
        quantity: orderParams.quantity,
        price: orderParams.price,
        error: exchangeResult.error,
      };
    } catch (error: any) {
      // Log error and update event
      await ctx.db.patch(eventId, {
        processingStatus: "order_failed",
        errorMessage: error.message || "Unknown processing error",
        processedAt: Date.now(),
      });
      return { success: false, error: error.message };
    }
  },
});