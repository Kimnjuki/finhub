import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Submit a new trading order
 */
export const submitOrder = mutation({
  args: {
    instrumentId: v.string(),
    instrumentSymbol: v.string(),
    side: v.union(v.literal("buy"), v.literal("sell")),
    orderType: v.union(v.literal("market"), v.literal("limit"), v.literal("stop_loss"), v.literal("take_profit")),
    quantity: v.float64(),
    price: v.optional(v.float64()),
    stopPrice: v.optional(v.float64()),
    timeInForce: v.optional(v.union(v.literal("GTC"), v.literal("IOC"), v.literal("FOK"))),
    notes: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    // Get user's default portfolio
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (!portfolio) {
      throw new Error("No default portfolio found");
    }

    // Validate sufficient balance for buy orders
    if (args.side === "buy") {
      const account = await ctx.db
        .query("portfolioAccounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("accountType"), "spot"))
        .first();

      if (!account) {
        throw new Error("No trading account found");
      }

      const estimatedCost = args.quantity * (args.price || 0);
      if (account.currentBalance < estimatedCost) {
        throw new Error("Insufficient balance");
      }
    }

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      userId,
      portfolioId: portfolio._id,
      instrumentId: args.instrumentId,
      instrumentSymbol: args.instrumentSymbol,
      side: args.side,
      orderType: args.orderType,
      quantity: args.quantity,
      price: args.price,
      stopPrice: args.stopPrice,
      timeInForce: args.timeInForce || "GTC",
      status: "pending",
      filledQuantity: 0,
      averageFillPrice: 0,
      fees: 0,
      notes: args.notes,
      submittedAt: Date.now(),
    });

    // Emit order event for execution
    await ctx.events.publish("order_submitted", {
      orderId,
      userId,
      instrumentSymbol: args.instrumentSymbol,
      side: args.side,
      quantity: args.quantity,
      orderType: args.orderType,
      timestamp: Date.now(),
    });

    return { orderId, status: "pending" };
  },
});

/**
 * Cancel an existing order
 */
export const cancelOrder = mutation({
  args: { orderId: v.string() },
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (order.status !== "pending" && order.status !== "open") {
      throw new Error("Order cannot be cancelled");
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    // Emit cancellation event
    await ctx.events.publish("order_cancelled", {
      orderId: args.orderId,
      userId: identity.subject,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update order status (internal - called by execution engine)
 */
export const updateOrderStatus = internalMutation({
  args: {
    orderId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("open"),
      v.literal("partially_filled"),
      v.literal("filled"),
      v.literal("cancelled"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    filledQuantity: v.optional(v.float64()),
    averageFillPrice: v.optional(v.float64()),
    fees: v.optional(v.float64()),
    exchangeOrderId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { orderId, status, filledQuantity, averageFillPrice, fees, exchangeOrderId } = args;

    const updates: Record<string, any> = {
      status,
      updatedAt: Date.now(),
    };

    if (filledQuantity !== undefined) updates.filledQuantity = filledQuantity;
    if (averageFillPrice !== undefined) updates.averageFillPrice = averageFillPrice;
    if (fees !== undefined) updates.fees = fees;
    if (exchangeOrderId) updates.exchangeOrderId = exchangeOrderId;

    if (status === "filled") {
      updates.filledAt = Date.now();
    }

    await ctx.db.patch(orderId, updates);

    // Get order details for event emission
    const order = await ctx.db.get(orderId);
    if (order) {
      // Emit order update event
      await ctx.events.publish("order_updated", {
        orderId,
        userId: order.userId,
        instrumentSymbol: order.instrumentSymbol,
        status,
        filledQuantity,
        averageFillPrice,
        timestamp: Date.now(),
      });

      // If order is filled, create portfolio transaction
      if (status === "filled" && filledQuantity && averageFillPrice) {
        await ctx.db.insert("portfolioTransactions", {
          accountId: order.portfolioId,
          userId: order.userId,
          instrumentId: order.instrumentId,
          transactionType: order.side,
          quantity: filledQuantity,
          price: averageFillPrice,
          totalValue: filledQuantity * averageFillPrice,
          fee: fees || 0,
          currency: "USD",
          notes: args.exchangeOrderId,
          externalRef: args.exchangeOrderId,
          executedAt: Date.now(),
          createdAt: Date.now(),
        });

        // Emit trade execution event
        await ctx.events.publish("trade_executed", {
          orderId,
          userId: order.userId,
          instrumentSymbol: order.instrumentSymbol,
          side: order.side,
          quantity: filledQuantity,
          price: averageFillPrice,
          fees: fees || 0,
          timestamp: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Get user's open orders
 */
export const getOpenOrders = mutation({
  args: {},
  async handler(ctx) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "open"),
          q.eq(q.field("status"), "partially_filled")
        )
      )
      .collect();

    return orders;
  },
});

/**
 * Get order history
 */
export const getOrderHistory = mutation({
  args: {
    limit: v.optional(v.float64()),
    offset: v.optional(v.float64()),
  },
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const limit = Math.min(args.limit || 50, 100);
    const offset = args.offset || 0;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .skip(offset)
      .take(limit)
      .collect();

    return orders;
  },
});

/**
 * Get order details
 */
export const getOrderById = mutation({
  args: { orderId: v.string() },
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return order;
  },
});

/**
 * Internal action to process pending orders (called by cron/webhook)
 */
export const processPendingOrders = internalMutation({
  args: {},
  async handler(ctx) {
    // Get all pending/open orders
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Group by instrument
    const ordersByInstrument = new Map<string, typeof pendingOrders>();
    for (const order of pendingOrders) {
      const existing = ordersByInstrument.get(order.instrumentId) || [];
      existing.push(order);
      ordersByInstrument.set(order.instrumentId, existing);
    }

    // Process each instrument's orders
    for (const [instrumentId, orders] of ordersByInstrument) {
      // Get current market price
      const quote = await ctx.runQuery(internal.marketDataQueries.getLatestQuote, {
        instrumentId,
      });

      if (!quote) continue;

      // Match orders against current price
      for (const order of orders) {
        const shouldExecute =
          (order.orderType === "market") ||
          (order.orderType === "limit" && order.price && quote.price <= order.price && order.side === "buy") ||
          (order.orderType === "limit" && order.price && quote.price >= order.price && order.side === "sell") ||
          (order.orderType === "stop_loss" && order.stopPrice && quote.price <= order.stopPrice) ||
          (order.orderType === "take_profit" && order.stopPrice && quote.price >= order.stopPrice);

        if (shouldExecute) {
          // Execute the order
          await ctx.db.patch(order._id, {
            status: "filled",
            filledQuantity: order.quantity,
            averageFillPrice: quote.price,
            fees: quote.price * order.quantity * 0.001, // 0.1% fee
            filledAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Create portfolio transaction
          await ctx.db.insert("portfolioTransactions", {
            accountId: order.portfolioId,
            userId: order.userId,
            instrumentId: order.instrumentId,
            transactionType: order.side,
            quantity: order.quantity,
            price: quote.price,
            totalValue: quote.price * order.quantity,
            fee: quote.price * order.quantity * 0.001,
            currency: "USD",
            executedAt: Date.now(),
            createdAt: Date.now(),
          });
        }
      }
    }

    return { processed: pendingOrders.length };
  },
});