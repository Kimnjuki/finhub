import { mutation, query, internalMutation, internalAction, QueryCtx, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Simple base64 encode for browser/edge runtime
const base64Encode = (str: string): string => {
  try {
    return btoa(str);
  } catch {
    // Fallback for unicode strings
    return btoa(unescape(encodeURIComponent(str)));
  }
};

// M-Pesa Daraja API Configuration
const getMpesaConfig = () => ({
  consumerKey: (globalThis as any).process?.env?.MPESA_CONSUMER_KEY || "",
  consumerSecret: (globalThis as any).process?.env?.MPESA_CONSUMER_SECRET || "",
  passkey: (globalThis as any).process?.env?.MPESA_PASSKEY || "",
  shortcode: (globalThis as any).process?.env?.MPESA_SHORTCODE || "174379",
  environment: (globalThis as any).process?.env?.MPESA_ENVIRONMENT || "sandbox", // sandbox | production
  callbackUrl: (globalThis as any).process?.env?.MPESA_CALLBACK_URL || "",
});

const MPESA_CONFIG = getMpesaConfig();

// Get OAuth access token from Safaricom
export const getMpesaAccessToken = internalAction({
  args: {},
  returns: v.string(),
  handler: async (_ctx: any) => {
    const config = getMpesaConfig();
    const auth = base64Encode(
      `${config.consumerKey}:${config.consumerSecret}`
    );

    const baseUrl =
      config.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const response = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get M-Pesa token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  },
});

// Initiate STK Push (Customer pays business)
export const initiateStkPush = mutation({
  args: {
    userId: v.string(),
    phoneNumber: v.string(),
    amount: v.number(),
    accountReference: v.string(),
    transactionDesc: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    merchantRequestId: v.optional(v.string()),
    checkoutRequestId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  }),
  handler: async (ctx: MutationCtx, args: { userId: string; phoneNumber: string; amount: number; accountReference: string; transactionDesc: string }) => {
    const { userId, phoneNumber, amount, accountReference, transactionDesc } = args;

    // Validate user exists
    const user = await ctx.db.query("users").withIndex("by_supabase_id", (q: any) =>
      q.eq("supabaseUserId", userId)
    ).first();

    if (!user) {
      return { success: false, errorMessage: "User not found" };
    }

    // Format phone number (add country code if needed)
    let formattedPhone = phoneNumber.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Convert amount to integer (no decimals)
    const amountInt = Math.floor(amount);

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const config = getMpesaConfig();
    const password = base64Encode(
      config.shortcode + config.passkey + timestamp
    );

    const accessToken = await (ctx as any).runAction((internal as any).payments.mpesa.getMpesaAccessToken, {});

    const baseUrl =
      config.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const requestBody = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amountInt,
      PartyA: formattedPhone,
      PartyB: config.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${config.callbackUrl}/api/webhooks/mpesa/callback`,
      AccountReference: accountReference.slice(0, 12), // Max 12 chars
      TransactionDesc: transactionDesc.slice(0, 13), // Max 13 chars
    };

    const response = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    // Log transaction attempt
    await ctx.db.insert("transactions", {
      userId: userId,
      amount: amount,
      currency: "KES",
      status: "pending",
      transactionType: "deposit" as any,
      paymentProvider: "Mpesa",
      transactionReference: data.CheckoutRequestID,
      supabaseId: user.supabaseUserId,
      createdAt: Date.now(),
    });

    if (data.ResponseCode === "0") {
      return {
        success: true,
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
      };
    } else {
      return {
        success: false,
        errorMessage: data.ResponseDescription || "STK Push failed",
      };
    }
  },
});

// B2C (Business to Customer) - Send money to user
export const initiateB2C = mutation({
  args: {
    userId: v.string(),
    phoneNumber: v.string(),
    amount: v.number(),
    remarks: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    transactionId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  }),
  handler: async (ctx: MutationCtx, args: { userId: string; phoneNumber: string; amount: number; remarks: string }) => {
    const { userId, phoneNumber, amount, remarks } = args;

    const user = await ctx.db.query("users").withIndex("by_supabase_id", (q: any) =>
      q.eq("supabaseUserId", userId)
    ).first();

    if (!user) {
      return { success: false, errorMessage: "User not found" };
    }

    // Check withdrawal limits based on KYC tier
    const withdrawalsToday = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q: any) => 
        q.and(
          q.eq(q.field("transactionType"), "withdrawal"),
          q.gte(q.field("createdAt"), Date.now() - 24 * 60 * 60 * 1000)
        )
      )
      .collect();

    const totalWithdrawnToday = withdrawalsToday.reduce(
      (sum: number, tx: any) => sum + tx.amount,
      0
    );

    // Get user KYC tier (simplified - should check actual KYC status)
    let dailyLimit = 1000; // Tier 1
    if (user.kycStatus === "approved") {
      dailyLimit = 100000; // Tier 2+
    }

    if (totalWithdrawnToday + amount > dailyLimit) {
      return {
        success: false,
        errorMessage: `Withdrawal limit exceeded. Daily limit: $${dailyLimit}`,
      };
    }

    const accessToken = await (ctx as any).runAction((internal as any).payments.mpesa.getMpesaAccessToken, {});

    const config = getMpesaConfig();
    const baseUrl =
      config.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const requestBody = {
      OriginatorConversationID: `B2C-${Date.now()}`,
      InitiatorName: (globalThis as any).process?.env?.MPESA_INITIATOR_NAME || "testapi",
      SecurityCredential: (globalThis as any).process?.env?.MPESA_SECURITY_CREDENTIAL || "",
      CommandID: "BusinessPayment",
      Amount: Math.floor(amount),
      PartyA: config.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks.slice(0, 100),
      QueueTimeOutURL: `${config.callbackUrl}/api/webhooks/mpesa/b2c/timeout`,
      ResultURL: `${config.callbackUrl}/api/webhooks/mpesa/b2c/result`,
    };

    const response = await fetch(
      `${baseUrl}/mpesa/b2c/v1/paymentrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    // Create withdrawal transaction
    await ctx.db.insert("transactions", {
      userId: userId,
      amount: amount,
      currency: "KES",
      status: "pending",
      transactionType: "withdrawal" as any,
      paymentProvider: "Mpesa",
      transactionReference: data.ConversationID,
      supabaseId: user.supabaseUserId,
      createdAt: Date.now(),
    });

    if (data.ResponseCode === "0") {
      return {
        success: true,
        transactionId: data.ConversationID,
      };
    } else {
      return {
        success: false,
        errorMessage: data.ResponseDescription || "B2C failed",
      };
    }
  },
});

// Query transaction status
export const queryTransactionStatus = query({
  args: {
    transactionId: v.string(),
  },
  returns: v.union(
    v.object({
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      ),
      amount: v.number(),
      phoneNumber: v.string(),
      mpesaReceiptNumber: v.optional(v.string()),
      transactionDate: v.optional(v.string()),
      resultCode: v.optional(v.string()),
      resultDesc: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx: QueryCtx, args: { transactionId: string }) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_created_at", (q: any) =>
        q.eq("transactionReference", args.transactionId)
      )
      .first();

    if (!transaction) {
      return null;
    }

    return {
      status: transaction.status as any,
      amount: transaction.amount,
      phoneNumber: "", // Add phone number field if needed
      mpesaReceiptNumber: transaction.transactionReference,
    };
  },
});

// Get user transaction history
export const getUserTransactions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("transactions"),
      amount: v.number(),
      currency: v.string(),
      status: v.string(),
      transactionType: v.string(),
      paymentProvider: v.optional(v.string()),
      transactionReference: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx: QueryCtx, args: { userId: string; limit?: number }) => {
    const limit = args.limit || 50;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return transactions.map((tx: any) => ({
      _id: tx._id,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      transactionType: tx.transactionType,
      paymentProvider: tx.paymentProvider,
      transactionReference: tx.transactionReference,
      createdAt: tx.createdAt,
    }));
  },
});

// C2B Validation (for receiving confirmation)
export const validateC2B = internalMutation({
  args: {
    transactionId: v.string(),
    phoneNumber: v.string(),
    amount: v.number(),
    mpesaReceiptNumber: v.string(),
    transactionDate: v.string(),
    resultCode: v.number(),
    resultDesc: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx: MutationCtx, args: { transactionId: string; phoneNumber: string; amount: number; mpesaReceiptNumber: string; transactionDate: string; resultCode: number; resultDesc: string }) => {
    try {
      // Find pending transaction
      const transaction = await ctx.db
        .query("transactions")
        .filter((q: any) => 
          q.and(
            q.eq(q.field("transactionReference"), args.transactionId),
            q.eq(q.field("status"), "pending")
          )
        )
        .first();

      if (!transaction) {
        console.log(`Transaction not found or already processed: ${args.transactionId}`);
        return { success: false };
      }

      // Update transaction status
      const newStatus = args.resultCode === 0 ? "completed" : "failed";

      await ctx.db.patch(transaction._id, {
        status: newStatus,
        transactionReference: args.mpesaReceiptNumber,
      });

      // If successful, credit user account
      if (newStatus === "completed" && transaction.userId) {
        // TODO: Credit user wallet balance and update user balance field
      }

      return { success: true };
    } catch (error) {
      console.error("C2B validation error:", error);
      return { success: false };
    }
  },
});

// B2C Result handler
export const handleB2CResult = internalMutation({
  args: {
    conversationId: v.string(),
    transactionId: v.string(),
    resultCode: v.number(),
    resultDesc: v.string(),
    amount: v.number(),
    mpesaReceiptNumber: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx: MutationCtx, args: { conversationId: string; transactionId: string; resultCode: number; resultDesc: string; amount: number; mpesaReceiptNumber?: string }) => {
    try {
      const transaction = await ctx.db
        .query("transactions")
        .filter((q: any) => 
          q.and(
            q.eq(q.field("transactionReference"), args.conversationId),
            q.eq(q.field("status"), "pending")
          )
        )
        .first();

      if (!transaction) {
        console.log(`B2C transaction not found: ${args.conversationId}`);
        return { success: false };
      }

      const newStatus = args.resultCode === 0 ? "completed" : "failed";

      await ctx.db.patch(transaction._id, {
        status: newStatus,
        transactionReference: args.mpesaReceiptNumber,
      });

      // Notify user of withdrawal result
      // TODO: Send notification via alert system

      return { success: true };
    } catch (error) {
      console.error("B2C result handler error:", error);
      return { success: false };
    }
  },
});

export { getMpesaConfig };