import { internalAction, internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Stripe API base URL
const STRIPE_API_BASE = "https://api.stripe.com/v1";

// Get Stripe config from env
const getStripeConfig = () => ({
  secretKey: (globalThis as any).process?.env?.STRIPE_SECRET_KEY || "",
  webhookSecret: (globalThis as any).process?.env?.STRIPE_WEBHOOK_SECRET || "",
  publishableKey: (globalThis as any).process?.env?.STRIPE_PUBLISHABLE_KEY || "",
});

async function stripeApiCall(endpoint: string, method: string = "GET", body?: Record<string, string>) {
  const { secretKey } = getStripeConfig();
  const url = `${STRIPE_API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  let fetchBody: string | undefined;
  if (body) {
    fetchBody = new URLSearchParams(body).toString();
  }

  const response = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Helper internal actions/mutations for user management
// These need to be defined or referenced properly
export const updateUserStripeCustomerId = internalMutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", args.userId)).first();
    if (user) {
      await ctx.db.patch(user._id, {
        // stripeCustomerId will be stored via a separate table or user field
      });
    }
  },
});

// Create a Stripe Checkout Session for subscription
export const createCheckoutSession = internalAction({
  args: {
    userId: v.string(),
    planId: v.string(),
    priceId: v.string(),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  async handler(ctx, args) {
    const { userId, planId, priceId, billingCycle, successUrl, cancelUrl } = args;

    // Get user from database
    const user = await ctx.runQuery(internal.queries.helpers.getUserById, { userId });
    if (!user) throw new Error("User not found");

    let stripeCustomerId = (user as any).stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripeApiCall("/customers", "POST", {
        email: user.email,
        metadata: JSON.stringify({ userId }),
      });
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripeApiCall("/checkout/sessions", "POST", {
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: JSON.stringify([{ price: priceId, quantity: 1 }]),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: JSON.stringify({ userId, planId, billingCycle }),
    });

    return { sessionId: session.id, url: session.url };
  },
});

// Handle Stripe webhook events
export const handleStripeWebhook = internalAction({
  args: {
    signature: v.string(),
    payload: v.string(),
  },
  async handler(ctx, args) {
    // Parse the event
    const event = JSON.parse(args.payload);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const { userId, planId, billingCycle } = metadata;
        
        if (userId && planId) {
          await ctx.runMutation(internal.subscriptions.activateSubscription, {
            userId,
            planId,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            billingCycle: billingCycle || "monthly",
            currentPeriodStart: Date.now(),
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          const subscription = await stripeApiCall(`/subscriptions/${subscriptionId}`);
          const currentPeriodEnd = subscription.current_period_end * 1000;
          await ctx.runMutation(internal.subscriptions.extendSubscription, {
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object;
        const failedSubId = failedInvoice.subscription;
        if (failedSubId) {
          await ctx.runMutation(internal.subscriptions.suspendSubscription, {
            stripeSubscriptionId: failedSubId,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object;
        await ctx.runMutation(internal.subscriptions.deactivateSubscription, {
          stripeSubscriptionId: deletedSub.id,
        });
        break;
      }

      case "customer.subscription.updated": {
        const updatedSub = event.data.object;
        const updatedMetadata = updatedSub.metadata || {};
        await ctx.runMutation(internal.subscriptions.updateSubscription, {
          stripeSubscriptionId: updatedSub.id,
          status: updatedSub.status,
          currentPeriodEnd: updatedSub.current_period_end * 1000,
          cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
          planId: updatedMetadata.planId,
          billingCycle: updatedMetadata.billingCycle,
        });
        break;
      }
    }

    return { received: true };
  },
});

// Create billing portal session
export const createBillingPortalSession = internalAction({
  args: {
    userId: v.string(),
    returnUrl: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.runQuery(internal.queries.helpers.getUserById, { userId: args.userId });
    if (!user || !(user as any).stripeCustomerId) throw new Error("No Stripe customer found");

    const session = await stripeApiCall("/billing_portal/sessions", "POST", {
      customer: (user as any).stripeCustomerId,
      return_url: args.returnUrl,
    });

    return { url: session.url };
  },
});

// Cancel subscription at period end
export const cancelSubscription = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
  },
  async handler(ctx, args) {
    await stripeApiCall(`/subscriptions/${args.stripeSubscriptionId}`, "POST", {
      cancel_at_period_end: "true",
    });
    return { success: true };
  },
});

// Reactivate cancelled subscription
export const reactivateSubscription = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
  },
  async handler(ctx, args) {
    await stripeApiCall(`/subscriptions/${args.stripeSubscriptionId}`, "POST", {
      cancel_at_period_end: "false",
    });
    return { success: true };
  },
});

// Upgrade/downgrade subscription
export const updateSubscriptionPlan = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
    newPriceId: v.string(),
  },
  async handler(ctx, args) {
    const subscription = await stripeApiCall(`/subscriptions/${args.stripeSubscriptionId}`);
    await stripeApiCall(`/subscriptions/${args.stripeSubscriptionId}`, "POST", {
      items: JSON.stringify([{
        id: subscription.items.data[0].id,
        price: args.newPriceId,
      }]),
      proration_behavior: "create_prorations",
    });
    return { success: true };
  },
});

// Create a payment intent for one-time payments
export const createPaymentIntent = internalAction({
  args: {
    amount: v.float64(),
    currency: v.string(),
    userId: v.string(),
  },
  async handler(ctx, args) {
    const paymentIntent = await stripeApiCall("/payment_intents", "POST", {
      amount: String(Math.round(args.amount * 100)),
      currency: args.currency.toLowerCase(),
      metadata: JSON.stringify({ userId: args.userId }),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },
});

// Retrieve subscription details
export const getSubscriptionDetails = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
  },
  async handler(ctx, args) {
    const subscription = await stripeApiCall(`/subscriptions/${args.stripeSubscriptionId}`);
    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start * 1000,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  },
});

// List available subscription prices from Stripe
export const listPrices = internalAction({
  args: {
    limit: v.optional(v.float64()),
  },
  async handler(ctx, args) {
    const prices = await stripeApiCall("/prices", "GET", {
      limit: String(args.limit || 10),
      active: "true",
      type: "recurring",
    });

    return prices.data.map((p: any) => ({
      id: p.id,
      product: p.product,
      unitAmount: p.unit_amount / 100,
      currency: p.currency,
      interval: p.recurring.interval,
      intervalCount: p.recurring.interval_count,
    }));
  },
});

// Get Stripe publishable key
export const getStripePublishableKey = query({
  args: {},
  async handler(ctx) {
    return getStripeConfig().publishableKey;
  },
});