import { internalAction } from "../_generated/server";
import { v } from "convex/values";

const getAirtelConfig = () => ({
  apiKey: (globalThis as any).process?.env?.AIRTEL_API_KEY || "",
  secretKey: (globalThis as any).process?.env?.AIRTEL_SECRET_KEY || "",
  environment: (globalThis as any).process?.env?.AIRTEL_ENVIRONMENT || "sandbox",
  baseUrl: (globalThis as any).process?.env?.AIRTEL_ENVIRONMENT === "production"
    ? "https://openapi.airtel.africa"
    : "https://sandbox.airtel.africa",
});

async function getAirtelToken() {
  const config = getAirtelConfig();
  const response = await fetch(`${config.baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.apiKey,
      client_secret: config.secretKey,
      grant_type: "client_credentials",
    }),
  });
  const data = await response.json();
  return data.access_token;
}

async function airtelApiCall(endpoint: string, method: string = "POST", body?: any) {
  const token = await getAirtelToken();
  const config = getAirtelConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-Country": "KEN",
    "X-Currency": "KES",
    "Content-Type": "application/json",
  };

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtel Money error: ${response.status} - ${error}`);
  }
  return response.json();
}

export const initiatePayment = internalAction({
  args: {
    amount: v.float64(),
    msisdn: v.string(),
    reference: v.string(),
    callbackUrl: v.string(),
  },
  async handler(ctx, args) {
    const data = await airtelApiCall("/standard/v1/payments/", "POST", {
      reference: args.reference,
      subscriber: { msisdn: args.msisdn },
      transaction: {
        amount: String(args.amount),
        country: "KEN",
        currency: "KES",
        id: `txn_${Date.now()}`,
      },
      callbackUrl: args.callbackUrl,
    });
    return { status: data.status, transactionId: data.transaction?.id };
  },
});

export const checkTransactionStatus = internalAction({
  args: { transactionId: v.string() },
  async handler(ctx, args) {
    return airtelApiCall(`/standard/v1/payments/${args.transactionId}`, "GET");
  },
});

export const initiateDisbursement = internalAction({
  args: {
    amount: v.float64(),
    msisdn: v.string(),
    reference: v.string(),
  },
  async handler(ctx, args) {
    const data = await airtelApiCall("/standard/v1/disbursements/", "POST", {
      reference: args.reference,
      subscriber: { msisdn: args.msisdn },
      transaction: {
        amount: String(args.amount),
        country: "KEN",
        currency: "KES",
        id: `disf_${Date.now()}`,
      },
    });
    return { status: data.status, transactionId: data.transaction?.id };
  },
});