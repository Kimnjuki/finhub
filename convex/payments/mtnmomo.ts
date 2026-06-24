import { internalAction } from "../_generated/server";
import { v } from "convex/values";

const getMtnConfig = () => ({
  apiKey: (globalThis as any).process?.env?.MTN_MOMO_API_KEY || "",
  subscriptionKey: (globalThis as any).process?.env?.MTN_MOMO_SUBSCRIPTION_KEY || "",
  environment: (globalThis as any).process?.env?.MTN_MOMO_ENVIRONMENT || "sandbox",
  baseUrl: (globalThis as any).process?.env?.MTN_MOMO_ENVIRONMENT === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com",
});

async function getMtnToken() {
  const config = getMtnConfig();
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      Authorization: `Basic ${btoa(`${config.apiKey}:`)}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

async function mtnApiCall(endpoint: string, method: string = "GET", body?: any) {
  const token = await getMtnToken();
  const config = getMtnConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-Reference-Id": crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MTN MoMo error: ${response.status} - ${error}`);
  }
  return response.status === 202 ? { status: "accepted" } : response.json();
}

export const requestToPay = internalAction({
  args: {
    amount: v.float64(),
    currency: v.string(),
    msisdn: v.string(),
    payerMessage: v.optional(v.string()),
    payeeNote: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const result = await mtnApiCall("/collection/v1_0/requesttopay", "POST", {
      amount: String(args.amount),
      currency: args.currency || "EUR",
      payer: { partyIdType: "MSISDN", partyId: args.msisdn },
      payerMessage: args.payerMessage || "FinHub Africa Deposit",
      payeeNote: args.payeeNote || "Payment for services",
    });
    return { status: result.status };
  },
});

export const getTransactionStatus = internalAction({
  args: { referenceId: v.string() },
  async handler(ctx, args) {
    return mtnApiCall(`/collection/v1_0/requesttopay/${args.referenceId}`);
  },
});

export const requestToWithdraw = internalAction({
  args: {
    amount: v.float64(),
    currency: v.string(),
    msisdn: v.string(),
  },
  async handler(ctx, args) {
    const result = await mtnApiCall("/disbursement/v1_0/transfer", "POST", {
      amount: String(args.amount),
      currency: args.currency || "EUR",
      payee: { partyIdType: "MSISDN", partyId: args.msisdn },
      payerMessage: "FinHub Africa Withdrawal",
    });
    return { status: result.status };
  },
});

export const getBalance = internalAction({
  args: {},
  async handler(ctx) {
    const data = await mtnApiCall("/collection/v1_0/account/balance");
    return { availableBalance: data.availableBalance, currency: data.currency };
  },
});