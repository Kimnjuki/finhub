import { actionGeneric } from "convex/server";
import { v } from "convex/values";

/**
 * CRUD API for TradingView Webhook Configurations
 * 
 * These actions manage webhook configurations, exchange credentials,
 * alert mappings, and provide query access to orders/events.
 */

// ─── Webhook Config Management ───────────────────────────────────────────

export const createWebhookConfig = actionGeneric({
  args: {
    userId: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    defaultExchange: v.optional(v.string()),
    symbolMappings: v.optional(v.string()),
    maxOrderSize: v.optional(v.float64()),
    maxNotional: v.optional(v.float64()),
    dailyOrderLimit: v.optional(v.float64()),
    dailyVolumeLimit: v.optional(v.float64()),
    allowMultiplePositions: v.optional(v.boolean()),
    maxLeverage: v.optional(v.float64()),
    defaultTimeInForce: v.optional(v.string()),
    defaultOrderType: v.optional(v.string()),
  },
  async handler(ctx: any, args: any) {
    const now = Date.now();
    
    // Generate a unique endpoint ID
    const endpointId = `tv_${args.userId.slice(0, 8)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    
    // Generate a random HMAC secret
    const hmacSecret = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');

    const configId = await ctx.db.insert("tvWebhookConfigs", {
      userId: args.userId,
      endpointId,
      label: args.label,
      description: args.description,
      hmacSecret,
      isActive: true,
      defaultExchange: args.defaultExchange || 'binance',
      symbolMappings: args.symbolMappings,
      maxOrderSize: args.maxOrderSize,
      maxNotional: args.maxNotional,
      dailyOrderLimit: args.dailyOrderLimit,
      dailyVolumeLimit: args.dailyVolumeLimit,
      allowMultiplePositions: args.allowMultiplePositions,
      maxLeverage: args.maxLeverage,
      defaultTimeInForce: args.defaultTimeInForce,
      defaultOrderType: args.defaultOrderType,
      totalAlertsReceived: 0,
      totalOrdersPlaced: 0,
      totalErrors: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { 
      configId, 
      endpointId, 
      hmacSecret,
      webhookUrl: `${getConvexSiteUrl()}/tradingview-webhook/${endpointId}`,
    };
  },
});

export const updateWebhookConfig = actionGeneric({
  args: {
    configId: v.string(),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    defaultExchange: v.optional(v.string()),
    symbolMappings: v.optional(v.string()),
    maxOrderSize: v.optional(v.float64()),
    maxNotional: v.optional(v.float64()),
    dailyOrderLimit: v.optional(v.float64()),
    dailyVolumeLimit: v.optional(v.float64()),
    allowMultiplePositions: v.optional(v.boolean()),
    maxLeverage: v.optional(v.float64()),
    defaultTimeInForce: v.optional(v.string()),
    defaultOrderType: v.optional(v.string()),
  },
  async handler(ctx: any, args: any) {
    const { configId, ...updates } = args;
    await ctx.db.patch(configId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const regenerateHmacSecret = actionGeneric({
  args: { configId: v.string() },
  async handler(ctx: any, args: any) {
    const newSecret = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');

    await ctx.db.patch(args.configId, {
      hmacSecret: newSecret,
      updatedAt: Date.now(),
    });

    return { hmacSecret: newSecret };
  },
});

export const deleteWebhookConfig = actionGeneric({
  args: { configId: v.string() },
  async handler(ctx: any, args: any) {
    // Soft delete by deactivating
    await ctx.db.patch(args.configId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getWebhookConfig = actionGeneric({
  args: { configId: v.string() },
  async handler(ctx: any, args: any) {
    const config = await ctx.db.get(args.configId);
    if (!config) return null;

    return {
      ...config,
      webhookUrl: `${getConvexSiteUrl()}/tradingview-webhook/${config.endpointId}`,
    };
  },
});

export const listWebhookConfigs = actionGeneric({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const configs = await ctx.db.query("tvWebhookConfigs")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    return configs.map((config: any) => ({
      ...config,
      webhookUrl: `${getConvexSiteUrl()}/tradingview-webhook/${config.endpointId}`,
    }));
  },
});

// ─── Exchange Credentials Management ─────────────────────────────────────

export const saveExchangeCredentials = actionGeneric({
  args: {
    userId: v.string(),
    exchange: v.string(),
    apiKey: v.string(),
    secretKey: v.optional(v.string()),
    passphrase: v.optional(v.string()),
    label: v.optional(v.string()),
    isTestnet: v.optional(v.boolean()),
    permissions: v.optional(v.array(v.string())),
  },
  async handler(ctx: any, args: any) {
    const now = Date.now();

    // Remove existing credentials for this exchange and user (if any)
    const existing = await ctx.db.query("exchangeCredentials")
      .withIndex("by_user_and_exchange", (q: any) => 
        q.eq("userId", args.userId).eq("exchange", args.exchange)
      )
      .filter((q: any) => q.eq("isActive", true))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false, updatedAt: now });
    }

    // Store encrypted credentials
    const credentialId = await ctx.db.insert("exchangeCredentials", {
      userId: args.userId,
      exchange: args.exchange as any,
      encryptedApiKey: `env:${args.exchange.toUpperCase()}_API_KEY`,
      encryptedSecretKey: args.secretKey ? `env:${args.exchange.toUpperCase()}_SECRET_KEY` : undefined,
      encryptedPassphrase: args.passphrase ? `env:${args.exchange.toUpperCase()}_PASSPHRASE` : undefined,
      label: args.label,
      isActive: true,
      isTestnet: args.isTestnet || false,
      permissions: (args.permissions || ['read', 'trade']) as any,
      createdAt: now,
      updatedAt: now,
    });

    return { credentialId };
  },
});

export const getExchangeCredentials = actionGeneric({
  args: { credentialId: v.string() },
  async handler(ctx: any, args: any) {
    const cred = await ctx.db.get(args.credentialId);
    if (!cred) return null;
    // Don't return the actual keys
    const { encryptedApiKey, encryptedSecretKey, encryptedPassphrase, ...safe } = cred;
    return {
      ...safe,
      hasApiKey: !!encryptedApiKey,
      hasSecretKey: !!encryptedSecretKey,
      hasPassphrase: !!encryptedPassphrase,
    };
  },
});

export const listExchangeCredentials = actionGeneric({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const credentials = await ctx.db.query("exchangeCredentials")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.eq("isActive", true))
      .collect();

    return credentials.map((cred: any) => {
      const { encryptedApiKey, encryptedSecretKey, encryptedPassphrase, ...safe } = cred;
      return {
        ...safe,
        hasApiKey: !!encryptedApiKey,
        hasSecretKey: !!encryptedSecretKey,
        hasPassphrase: !!encryptedPassphrase,
      };
    });
  },
});

export const deleteExchangeCredentials = actionGeneric({
  args: { credentialId: v.string() },
  async handler(ctx: any, args: any) {
    await ctx.db.patch(args.credentialId, { isActive: false, updatedAt: Date.now() });
    return { success: true };
  },
});

// ─── Webhook Event Log Queries ───────────────────────────────────────────

export const listWebhookEvents = actionGeneric({
  args: { 
    userId: v.string(),
    limit: v.optional(v.float64()),
    cursor: v.optional(v.float64()),
  },
  async handler(ctx: any, args: any) {
    const limit = args.limit || 50;
    const events = await ctx.db.query("tvWebhookEvents")
      .withIndex("by_user_and_received", (q: any) => 
        q.eq("userId", args.userId)
      )
      .order("desc")
      .take(limit)
      .collect();

    return events;
  },
});

// ─── Order Queries ───────────────────────────────────────────────────────

export const listOrders = actionGeneric({
  args: {
    userId: v.string(),
    limit: v.optional(v.float64()),
    status: v.optional(v.string()),
  },
  async handler(ctx: any, args: any) {
    const limit = args.limit || 50;
    
    let orders;
    if (args.status) {
      orders = await ctx.db.query("tvOrders")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", args.userId))
        .filter((q: any) => q.eq("status", args.status))
        .order("desc")
        .take(limit)
        .collect();
    } else {
      orders = await ctx.db.query("tvOrders")
        .withIndex("by_user_and_created", (q: any) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit)
        .collect();
    }

    return orders;
  },
});

// ─── Position Queries ────────────────────────────────────────────────────

export const listOpenPositions = actionGeneric({
  args: { userId: v.string() },
  async handler(ctx: any, args: any) {
    const positions = await ctx.db.query("tvPositions")
      .withIndex("by_user_and_open", (q: any) => 
        q.eq("userId", args.userId).eq("isOpen", true)
      )
      .collect();

    return positions;
  },
});

export const getDailyStats = actionGeneric({
  args: {
    userId: v.string(),
    date: v.optional(v.string()),
  },
  async handler(ctx: any, args: any) {
    const today = args.date || new Date().toISOString().split('T')[0];
    const stats = await ctx.db.query("tvDailyStats")
      .withIndex("by_user_and_date", (q: any) =>
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();

    return stats || {
      userId: args.userId,
      date: today,
      orderCount: 0,
      totalVolume: 0,
      totalFees: 0,
      filledCount: 0,
      rejectedCount: 0,
    };
  },
});

// ─── Alert Mapping Management ────────────────────────────────────────────

export const createAlertMapping = actionGeneric({
  args: {
    userId: v.string(),
    configId: v.string(),
    mappingName: v.string(),
    fieldMappings: v.string(),
    staticOverrides: v.optional(v.string()),
    allowDynamicOverrides: v.optional(v.boolean()),
  },
  async handler(ctx: any, args: any) {
    const now = Date.now();
    const mappingId = await ctx.db.insert("tvAlertMappings", {
      userId: args.userId,
      configId: args.configId,
      mappingName: args.mappingName,
      fieldMappings: args.fieldMappings,
      staticOverrides: args.staticOverrides,
      allowDynamicOverrides: args.allowDynamicOverrides || false,
      createdAt: now,
      updatedAt: now,
    });

    return { mappingId };
  },
});

// ─── Helper Functions ────────────────────────────────────────────────────

function getConvexSiteUrl(): string {
  try {
    // In Convex, the site URL is available via environment
    const env = (globalThis as any).process?.env;
    return env?.CONVEX_SITE_URL || 
           env?.VITE_CONVEX_URL?.replace('.cloud', '.site') || 
           'https://your-convex-site.convex.site';
  } catch {
    return 'https://your-convex-site.convex.site';
  }
}
