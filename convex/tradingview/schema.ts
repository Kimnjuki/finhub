import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// ─── Shared union types for TradingView integration ───────────────────────
export const tvOrderType = v.union(
  v.literal('market'),
  v.literal('limit'),
  v.literal('stop'),
  v.literal('stop_limit'),
  v.literal('trailing_stop')
);

export const tvOrderSide = v.union(
  v.literal('buy'),
  v.literal('sell'),
  v.literal('short'),
  v.literal('cover')
);

export const tvOrderStatus = v.union(
  v.literal('pending'),
  v.literal('placed'),
  v.literal('partially_filled'),
  v.literal('filled'),
  v.literal('canceled'),
  v.literal('rejected'),
  v.literal('expired')
);

export const tvTimeInForce = v.union(
  v.literal('GTC'),  // Good 'Til Canceled
  v.literal('IOC'),  // Immediate or Cancel
  v.literal('FOK'),  // Fill or Kill
  v.literal('GTD')   // Good 'Til Date
);

export const tvExchangeName = v.union(
  v.literal('binance'),
  v.literal('coinbase'),
  v.literal('kraken'),
  v.literal('bybit'),
  v.literal('okx'),
  v.literal('deribit')
);

/**
 * TradingView Webhook Integration Schema Extensions
 * 
 * These tables extend the base schema for TradingView alert → order execution.
 */

export const tvWebhookConfigs = defineTable({
  userId: v.string(),
  
  // Webhook endpoint identity
  endpointId: v.string(),         // Unique slug for the URL path: /webhooks/tv/{endpointId}
  label: v.string(),
  description: v.optional(v.string()),
  
  // Security
  hmacSecret: v.string(),          // Shared secret for HMAC-SHA256 verification
  
  // Alert processing settings
  isActive: v.boolean(),
  
  // Which exchange to use by default
  defaultExchange: v.optional(tvExchangeName),
  
  // Override symbol mapping (e.g., {"BTCUSD": "BTCUSDT", "ETHUSD": "ETHUSDT"})
  symbolMappings: v.optional(v.string()),
  
  // Risk controls
  maxOrderSize: v.optional(v.float64()),     // Maximum order size in base currency
  maxNotional: v.optional(v.float64()),       // Maximum notional value in quote currency
  dailyOrderLimit: v.optional(v.float64()),   // Max orders per day
  dailyVolumeLimit: v.optional(v.float64()),  // Max total volume per day (USD)
  
  // Position management
  allowMultiplePositions: v.optional(v.boolean()),
  maxLeverage: v.optional(v.float64()),
  
  // Default order parameters
  defaultTimeInForce: v.optional(tvTimeInForce),
  defaultOrderType: v.optional(tvOrderType),
  
  // Stats
  totalAlertsReceived: v.optional(v.float64()),
  totalOrdersPlaced: v.optional(v.float64()),
  totalErrors: v.optional(v.float64()),
  lastAlertAt: v.optional(v.float64()),
  
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
  .index('by_user', ['userId'])
  .index('by_endpoint_id', ['endpointId'])
  .index('by_user_and_active', ['userId', 'isActive']);

/**
 * Schema for TV alert payload template mappings.
 * Users define how fields in the TradingView alert JSON map to order parameters.
 */
export const tvAlertMappings = defineTable({
  userId: v.string(),
  configId: v.string(),
  
  mappingName: v.string(),
  
  // JSONPath-like field mapping from webhook payload to order parameters
  // e.g., {"symbol": "$.ticker", "side": "$.action", "quantity": "$.strategy.order.contracts"}
  fieldMappings: v.string(),
  
  // Static overrides
  staticOverrides: v.optional(v.string()),
  
  // Allow dynamic overrides from alert payload
  allowDynamicOverrides: v.optional(v.boolean()),
  
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
  .index('by_user', ['userId'])
  .index('by_config', ['configId']);

/**
 * Storage for exchange API credentials (encrypted at rest via Convex env vars)
 */
export const exchangeCredentials = defineTable({
  userId: v.string(),
  exchange: tvExchangeName,
  
  // Encrypted credentials - decryption happens in actions
  encryptedApiKey: v.string(),
  encryptedSecretKey: v.optional(v.string()),
  encryptedPassphrase: v.optional(v.string()),  // For exchanges like Coinbase
  
  label: v.optional(v.string()),
  isActive: v.boolean(),
  isTestnet: v.optional(v.boolean()),
  
  // Permissions scope
  permissions: v.array(v.union(
    v.literal('read'),
    v.literal('trade'),
    v.literal('withdraw')
  )),
  
  lastUsedAt: v.optional(v.float64()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
  .index('by_user', ['userId'])
  .index('by_user_and_exchange', ['userId', 'exchange'])
  .index('by_active', ['isActive']);

/**
 * Log of received TradingView webhook events
 */
export const tvWebhookEvents = defineTable({
  configId: v.string(),
  userId: v.string(),
  
  // Raw payload
  rawPayload: v.string(),
  
  // Parsed fields
  parsedSymbol: v.optional(v.string()),
  parsedSide: v.optional(v.string()),
  parsedQuantity: v.optional(v.float64()),
  parsedPrice: v.optional(v.float64()),
  parsedOrderType: v.optional(v.string()),
  parsedStrategyName: v.optional(v.string()),
  
  // HMAC verification result
  hmacValid: v.boolean(),
  signatureProvided: v.optional(v.string()),
  
  // Processing info
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  
  // Result
  processingStatus: v.union(
    v.literal('received'),
    v.literal('parsed'),
    v.literal('mapped'),
    v.literal('order_placed'),
    v.literal('order_failed'),
    v.literal('rejected'),
    v.literal('skipped')
  ),
  errorMessage: v.optional(v.string()),
  
  // Linked order if one was placed
  linkedOrderId: v.optional(v.string()),
  
  receivedAt: v.float64(),
  processedAt: v.optional(v.float64()),
})
  .index('by_config', ['configId'])
  .index('by_user', ['userId'])
  .index('by_status', ['processingStatus'])
  .index('by_received_at', ['receivedAt'])
  .index('by_user_and_received', ['userId', 'receivedAt']);

/**
 * Orders placed via TradingView webhook automation
 */
export const tvOrders = defineTable({
  userId: v.string(),
  configId: v.string(),
  eventId: v.optional(v.string()),
  
  // Exchange info
  exchange: tvExchangeName,
  exchangeOrderId: v.optional(v.string()),
  credentialId: v.string(),
  
  // Instrument
  symbol: v.string(),
  canonicalSymbol: v.optional(v.string()),
  
  // Order details
  side: tvOrderSide,
  orderType: tvOrderType,
  quantity: v.float64(),
  price: v.optional(v.float64()),
  stopPrice: v.optional(v.float64()),
  limitPrice: v.optional(v.float64()),
  timeInForce: v.optional(tvTimeInForce),
  leverage: v.optional(v.float64()),
  
  // Status
  status: tvOrderStatus,
  filledQuantity: v.optional(v.float64()),
  filledPrice: v.optional(v.float64()),
  filledValue: v.optional(v.float64()),
  fee: v.optional(v.float64()),
  feeCurrency: v.optional(v.string()),
  
  // Position tracking
  positionId: v.optional(v.string()),
  reduceOnly: v.optional(v.boolean()),
  
  // Timelines
  placedAt: v.optional(v.float64()),
  filledAt: v.optional(v.float64()),
  canceledAt: v.optional(v.float64()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
  .index('by_user', ['userId'])
  .index('by_config', ['configId'])
  .index('by_exchange', ['exchange'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_user_and_created', ['userId', 'createdAt'])
  .index('by_exchange_order_id', ['exchangeOrderId']);

/**
 * TradingView-linked position tracking
 */
export const tvPositions = defineTable({
  userId: v.string(),
  exchange: tvExchangeName,
  credentialId: v.string(),
  
  symbol: v.string(),
  canonicalSymbol: v.optional(v.string()),
  
  side: v.union(v.literal('long'), v.literal('short')),
  quantity: v.float64(),
  entryPrice: v.float64(),
  currentPrice: v.optional(v.float64()),
  
  unrealizedPnl: v.optional(v.float64()),
  realizedPnl: v.optional(v.float64()),
  
  leverage: v.optional(v.float64()),
  liquidationPrice: v.optional(v.float64()),
  marginUsed: v.optional(v.float64()),
  
  isOpen: v.boolean(),
  openedAt: v.float64(),
  closedAt: v.optional(v.float64()),
  updatedAt: v.float64(),
})
  .index('by_user', ['userId'])
  .index('by_exchange', ['exchange'])
  .index('by_user_and_open', ['userId', 'isOpen'])
  .index('by_user_exchange_symbol', ['userId', 'exchange', 'symbol']);

/**
 * Daily trading stats per user (for risk controls)
 */
export const tvDailyStats = defineTable({
  userId: v.string(),
  date: v.string(),  // "YYYY-MM-DD"
  
  orderCount: v.float64(),
  totalVolume: v.float64(),
  totalFees: v.float64(),
  filledCount: v.float64(),
  rejectedCount: v.float64(),
  totalPnl: v.optional(v.float64()),
  
  updatedAt: v.float64(),
})
  .index('by_user_and_date', ['userId', 'date']);