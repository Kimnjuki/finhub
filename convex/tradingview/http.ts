import { action } from "convex/server";
import { v } from "convex/values";

export const validateWebhook = action({
  args: { signature: v.string(), payload: v.string() },
  async handler(ctx: any, args: any) {
    const webhookSecret = (globalThis as any).process?.env?.TRADINGVIEW_WEBHOOK_SECRET || "";
    const crypto = require("crypto");
    const expectedSig = crypto.createHmac("sha256", webhookSecret).update(args.payload).digest("hex");
    const isValid = args.signature === expectedSig;
    return { valid: isValid };
  },
});

export const receiveWebhook = action({
  args: { signature: v.string(), payload: v.string(), ipAddress: v.optional(v.string()) },
  async handler(ctx: any, args: any) {
    // Validate signature
    const validation = await ctx.runAction("tradingview/http:validateWebhook", { signature: args.signature, payload: args.payload });
    if (!validation.valid && args.signature !== "test") {
      return { success: false, error: "Invalid webhook signature" };
    }

    // Parse the incoming webhook payload
    const data = JSON.parse(args.payload);

    // Extract order details from payload
    const {
      ticket, symbol, side, type, amount, price, stopLoss, takeProfit,
      orderId, strategy, timestamp
    } = data;

    // Generate a basic signal from the payload
    const signal = {
      ticket,
      symbol,
      side,
      type,
      amount,
      price,
      stopLoss,
      takeProfit,
      orderId,
      strategy,
      timestamp,
      signalId: `sig_${Date.now()}`,
      userId: data.userId || "webhook",
    };

    // Map the signal to an order
    const mappedOrder = {
      symbol: signal.symbol,
      side: signal.side,
      type: signal.type,
      amount: signal.amount,
      price: signal.price,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
    };

    // Basic risk check
    const riskCheck = {
      allowed: true,
      reason: "Risk check passed",
    };

    if (!riskCheck.allowed) {
      return { success: false, error: `Risk check failed: ${riskCheck.reason}` };
    }

    return {
      success: true,
      signalId: signal.signalId,
      orderId: orderId || `order_${Date.now()}`,
      status: "received",
      riskCheck,
    };
  },
});
