import { internalAction } from "../_generated/server";
import { v } from "convex/values";

const PAYSTACK_API_BASE = "https://api.paystack.co";

const getPaystackConfig = () => ({
  secretKey: (globalThis as any).process?.env?.PAYSTACK_SECRET_KEY || "",
});

async function paystackApiCall(endpoint: string, method: string = "GET", body?: Record<string, any>) {
  const { secretKey } = getPaystackConfig();
  const url = `${PAYSTACK_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  let fetchBody: string | undefined;
  if (body && method !== "GET") {
    fetchBody = JSON.stringify(body);
  }

  const response = await fetch(url, { method, headers, body: fetchBody });
  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

// Initialize a transaction (creates payment page/checkout)
export const initializeTransaction = internalAction({
  args: {
    amount: v.float64(),
    email: v.string(),
    userId: v.string(),
    callbackUrl: v.string(),
  },
  async handler(ctx, args) {
    const data = await paystackApiCall("/transaction/initialize", "POST", {
      amount: String(Math.round(args.amount * 100)),
      email: args.email,
      metadata: JSON.stringify({ userId: args.userId }),
      callback_url: args.callbackUrl,
    });
    return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
  },
});

// Verify a transaction by reference
export const verifyTransaction = internalAction({
  args: { reference: v.string() },
  async handler(ctx, args) {
    const data = await paystackApiCall(`/transaction/verify/${encodeURIComponent(args.reference)}`);
    return {
      status: data.data.status,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      paidAt: data.data.paid_at,
      channel: data.data.channel,
      customerEmail: data.data.customer?.email,
      customerCode: data.data.customer?.customer_code,
    };
  },
});

// Handle Paystack webhook events
export const handlePaystackWebhook = internalAction({
  args: { signature: v.string(), payload: v.string() },
  async handler(ctx, args) {
    const event = JSON.parse(args.payload);
    switch (event.event) {
      case "charge.success": {
        const { reference, metadata, amount, currency } = event.data;
        const userId = metadata?.userId;
        if (userId) {
          // Log the successful transaction
          await ctx.db.insert("transactions", {
            userId,
            amount: amount / 100,
            currency: currency || "NGN",
            status: "completed",
            transactionType: "subscription",
            paymentProvider: "paystack",
            transactionReference: reference,
            createdAt: Date.now(),
          });
        }
        break;
      }
      case "transfer.success": {
        // Handle successful transfer
        break;
      }
      case "transfer.failed": {
        // Handle failed transfer
        break;
      }
    }
    return { received: true };
  },
});

// List banks available for transfer
export const listBanks = internalAction({
  args: { country: v.optional(v.string()) },
  async handler(ctx, args) {
    const country = args.country || "nigeria";
    const data = await paystackApiCall(`/bank?country=${encodeURIComponent(country)}`);
    return data.data.map((b: any) => ({
      code: b.code,
      name: b.name,
      slug: b.slug,
      longcode: b.longcode,
    }));
  },
});

// Initiate a transfer to a recipient
export const initiateTransfer = internalAction({
  args: {
    amount: v.float64(),
    recipient: v.string(),
    reason: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const data = await paystackApiCall("/transfer", "POST", {
      source: "balance",
      amount: String(Math.round(args.amount * 100)),
      recipient: args.recipient,
      reason: args.reason || "Withdrawal",
    });
    return {
      transferCode: data.data.transfer_code,
      status: data.data.status,
      amount: data.data.amount / 100,
    };
  },
});

// Create a transfer recipient (bank account)
export const createTransferRecipient = internalAction({
  args: {
    name: v.string(),
    accountNumber: v.string(),
    bankCode: v.string(),
  },
  async handler(ctx, args) {
    const data = await paystackApiCall("/transferrecipient", "POST", {
      type: "nuban",
      name: args.name,
      account_number: args.accountNumber,
      bank_code: args.bankCode,
      currency: "NGN",
    });
    return { recipientCode: data.data.recipient_code, details: data.data.details };
  },
});