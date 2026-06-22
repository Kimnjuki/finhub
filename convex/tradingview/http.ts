import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { processTradingViewAlert } from "./webhookHandler";

/**
 * TradingView Webhook HTTP Endpoint
 * 
 * This is the public endpoint that TradingView sends alert webhooks to.
 * URL format: {CONVEX_SITE_URL}/tradingview-webhook/{endpointId}
 * 
 * TradingView Alert Configuration:
 * - Webhook URL: https://{your-convex-site}.convex.site/tradingview-webhook/{your-endpoint-id}
 * - Message format: JSON with ticker, action, price, volume, etc.
 */

// ─── Webhook HTTP Action (called by HTTP router) ─────────────────────────

export const handleTradingViewWebhook = mutation({
  args: {
    endpointId: v.string(),
    rawBody: v.string(),
    signature: v.optional(v.string()),
    contentType: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { endpointId, rawBody, signature } = args;

    // 1. Find the webhook config by endpoint ID
    const config = await ctx.db.query("tvWebhookConfigs")
      .withIndex("by_endpoint_id", (q: any) => q.eq("endpointId", endpointId))
      .first();

    if (!config) {
      return { 
        status: 404, 
        body: JSON.stringify({ error: 'Webhook endpoint not found' }) 
      };
    }

    if (!config.isActive) {
      return { 
        status: 403, 
        body: JSON.stringify({ error: 'Webhook endpoint is disabled' }) 
      };
    }

    // 2. Verify HMAC signature if secret is configured
    if (config.hmacSecret && signature) {
      const expectedSig = await generateHmacSignature(config.hmacSecret, rawBody);
      if (signature !== expectedSig) {
        await ctx.db.insert("tvWebhookEvents", {
          configId: config._id,
          userId: config.userId,
          rawPayload: rawBody,
          hmacValid: false,
          signatureProvided: signature,
          ipAddress: args.ipAddress,
          userAgent: args.userAgent,
          processingStatus: "rejected",
          errorMessage: "HMAC signature verification failed",
          receivedAt: Date.now(),
          processedAt: Date.now(),
        });
        return { 
          status: 401, 
          body: JSON.stringify({ error: 'Invalid HMAC signature' }) 
        };
      }
    } else if (config.hmacSecret && !signature) {
      // Secret configured but no signature provided
      return { 
        status: 401, 
        body: JSON.stringify({ error: 'HMAC signature required' }) 
      };
    }

    // 3. Process the alert via the main handler
    try {
      const result = await ctx.run(processTradingViewAlert, {
        configId: config._id,
        userId: config.userId,
        rawPayload: rawBody,
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
        signature,
      });

      if (result.success) {
        return {
          status: 200,
          body: JSON.stringify({
            success: true,
            orderId: result.orderId,
            exchangeOrderId: result.exchangeOrderId,
            symbol: result.symbol,
            side: result.side,
            quantity: result.quantity,
            price: result.price,
          }),
        };
      } else {
        return {
          status: 400,
          body: JSON.stringify({
            success: false,
            error: result.error,
          }),
        };
      }
    } catch (error: any) {
      return {
        status: 500,
        body: JSON.stringify({
          success: false,
          error: `Internal error: ${error.message}`,
        }),
      };
    }
  },
});

/**
 * Generate HMAC-SHA256 signature for TradingView webhook payload verification.
 * TradingView signs webhooks using the HMAC secret configured in the alert.
 */
export async function generateHmacSignature(secret: string, body: string): Promise<string> {
  try {
    // Use Web Crypto API available in Convex runtime
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return hex;
  } catch {
    // Fallback for environments without Web Crypto
    // Simple hash for demo purposes
    let hash = 0;
    const combined = secret + body;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}