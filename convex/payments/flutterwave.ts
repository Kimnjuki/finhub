import { internalAction } from "../_generated/server";
import { v } from "convex/values";

const FLW_API_BASE = "https://api.flutterwave.com/v3";

const getFlwConfig = () => ({
  secretKey: (globalThis as any).process?.env?.FLUTTERWAVE_SECRET_KEY || "",
});

async function flwApiCall(endpoint: string, method: string = "GET", body?: Record<string, any>) {
  const { secretKey } = getFlwConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${FLW_API_BASE}${endpoint}`, {
    method,
    headers,
    body: body && method !== "GET" ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(`Flutterwave error: ${data.message}`);
  }
  return data;
}

export const initiatePayment = internalAction({
  args: {
    amount: v.float64(),
    currency: v.string(),
    email: v.string(),
    userId: v.string(),
    redirectUrl: v.string(),
    paymentOptions: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const data = await flwApiCall("/payments", "POST", {
      tx_ref: `txn_${Date.now()}_${args.userId.slice(0, 8)}`,
      amount: args.amount,
      currency: args.currency || "KES",
      redirect_url: args.redirectUrl,
      meta: { userId: args.userId },
      customer: {
        email: args.email,
      },
      customizations: {
        title: "FinHub Africa Payment",
        logo: "https://finhub.africa/logo.png",
      },
      payment_options: args.paymentOptions || "card,mobilemoney,ussd",
    });
    return { link: data.data.link, transactionRef: data.data.tx_ref };
  },
});

export const verifyTransaction = internalAction({
  args: { transactionId: v.string() },
  async handler(ctx, args) {
    const data = await flwApiCall(`/transactions/${args.transactionId}/verify`);
    return {
      status: data.data.status,
      amount: data.data.amount,
      currency: data.data.currency,
      chargedAmount: data.data.charged_amount,
      paymentMethod: data.data.payment_type,
      createdAt: data.data.created_at,
    };
  },
});

export const handleFlutterwaveWebhook = internalAction({
  args: { signature: v.string(), payload: v.string() },
  async handler(ctx, args) {
    const event = JSON.parse(args.payload);
    if (event.event === "charge.completed" && event.data.status === "successful") {
      const { tx_ref, amount, currency, meta } = event.data;
      const userId = meta?.userId;
      if (userId) {
        await ctx.db.insert("transactions", {
          userId,
          amount,
          currency: currency || "KES",
          status: "completed",
          transactionType: "subscription",
          paymentProvider: "flutterwave",
          transactionReference: tx_ref,
          createdAt: Date.now(),
        });
      }
    }
    return { received: true };
  },
});

export const initiateTransfer = internalAction({
  args: {
    amount: v.float64(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountBank: v.string(),
    narration: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const data = await flwApiCall("/transfers", "POST", {
      account_bank: args.bankCode,
      account_number: args.accountNumber,
      amount: args.amount,
      narration: args.narration || "FinHub Africa Withdrawal",
      currency: "KES",
      reference: `trf_${Date.now()}`,
      callback_url: "https://finhub.africa/api/webhooks/flutterwave",
    });
    return { id: data.data.id, status: data.data.status, reference: data.data.reference };
  },
});

export const listBanks = internalAction({
  args: { country: v.string() },
  async handler(ctx, args) {
    const data = await flwApiCall(`/banks/${args.country}`);
    return data.data.map((b: any) => ({
      code: b.code,
      name: b.name,
      id: b.id,
    }));
  },
});