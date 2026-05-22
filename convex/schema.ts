import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// ─── Shared union types ────────────────────────────────────────────────────
const assetClass = v.union(
  v.literal('crypto'), v.literal('equity'), v.literal('fx'),
  v.literal('commodity'), v.literal('index'), v.literal('derivative')
);
const marketType = v.union(
  v.literal('spot'), v.literal('perpetual'), v.literal('future'), v.literal('option')
);
const accessLevel = v.union(
  v.literal('free'), v.literal('basic'), v.literal('advanced'),
  v.literal('premium'), v.literal('full'), v.literal('enterprise')
);
const sourceType = v.union(
  v.literal('exchange'), v.literal('broker'), v.literal('news'),
  v.literal('macro'), v.literal('onchain'), v.literal('social')
);
const streamChannel = v.union(
  v.literal('trades'), v.literal('ticker'), v.literal('orderbook_l1'),
  v.literal('orderbook_l2'), v.literal('orderbook_l3'), v.literal('kline'),
  v.literal('funding'), v.literal('open_interest'), v.literal('liquidations'),
  v.literal('mark_price'), v.literal('index_price'), v.literal('nav')
);
const alertCondition = v.union(
  v.literal('price_above'), v.literal('price_below'), v.literal('price_pct_change'),
  v.literal('volume_spike'), v.literal('spread_widening'), v.literal('funding_change'),
  v.literal('liquidation_cluster'), v.literal('news_event'), v.literal('oi_change'),
  v.literal('whale_trade'), v.literal('signal_trigger')
);
const signalType = v.union(
  v.literal('momentum'), v.literal('mean_reversion'), v.literal('breakout'),
  v.literal('sentiment'), v.literal('onchain_flow'), v.literal('funding_arb'),
  v.literal('cross_asset'), v.literal('ai_generated')
);
const impactType = v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical'));
const eventStatus = v.union(
  v.literal('scheduled'), v.literal('tentative'), v.literal('postponed'),
  v.literal('canceled'), v.literal('complete')
);
const streamStatus = v.union(
  v.literal('active'), v.literal('stale'), v.literal('resyncing'), v.literal('disabled')
);

export default defineSchema({

  // ── IDENTITY & ACCESS ────────────────────────────────────────────────────
  users: defineTable({
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isVerified: v.boolean(),
    passwordHash: v.optional(v.string()),
    signInMethod: v.union(v.literal('email'), v.literal('google'), v.literal('apple'), v.literal('facebook')),
    supabaseUserId: v.string(),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    lastActiveAt: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_email', ['email'])
    .index('by_supabase_id', ['supabaseUserId'])
    .index('by_last_active', ['lastActiveAt']),

  roles: defineTable({ roleName: v.string() })
    .index('by_role_name', ['roleName']),

  userRoles: defineTable({
    userId: v.string(), roleName: v.string(), assignedAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_role', ['roleName'])
    .index('by_user_and_role', ['userId', 'roleName']),

  apiKeys: defineTable({
    userId: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    label: v.optional(v.string()),
    scopes: v.array(v.string()),
    lastUsedAt: v.optional(v.float64()),
    expiresAt: v.optional(v.float64()),
    isActive: v.boolean(),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_key_prefix', ['keyPrefix'])
    .index('by_key_hash', ['keyHash']),

  auditLogs: defineTable({
    userId: v.optional(v.string()),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_action', ['action'])
    .index('by_created_at', ['createdAt']),

  // ── PLANS, BILLING, ENTITLEMENTS ─────────────────────────────────────────
  subscriptionPlans: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    priceMonthly: v.float64(),
    priceYearly: v.float64(),
    apiCallsPerMonth: v.optional(v.float64()),
    wsConnectionsAllowed: v.optional(v.float64()),
    alertsAllowed: v.optional(v.float64()),
    watchlistsAllowed: v.optional(v.float64()),
    isActive: v.boolean(),
    stripePriceIdMonthly: v.optional(v.string()),
    stripePriceIdYearly: v.optional(v.string()),
    supabasePlanId: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_active', ['isActive'])
    .index('by_name', ['name']),

  userSubscriptions: defineTable({
    userId: v.string(),
    planId: v.string(),
    status: v.union(
      v.literal('active'), v.literal('canceled'), v.literal('past_due'),
      v.literal('trialing'), v.literal('incomplete')
    ),
    billingCycle: v.union(v.literal('monthly'), v.literal('yearly')),
    currentPeriodStart: v.float64(),
    currentPeriodEnd: v.float64(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    supabaseId: v.string(),
    trialEndsAt: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_plan', ['planId'])
    .index('by_status', ['status'])
    .index('by_stripe_id', ['stripeSubscriptionId']),

  featureAccess: defineTable({
    userId: v.string(),
    featureName: v.string(),
    accessLevel,
    expiresAt: v.optional(v.float64()),
    grantedBy: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_feature', ['userId', 'featureName']),

  dataEntitlements: defineTable({
    userId: v.string(),
    sourceId: v.string(),
    channel: v.string(),
    marketType: v.optional(v.string()),
    accessLevel,
    grantedAt: v.float64(),
    expiresAt: v.optional(v.float64()),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_source', ['userId', 'sourceId'])
    .index('by_user_source_channel', ['userId', 'sourceId', 'channel']),

  rateLimits: defineTable({
    userId: v.string(),
    windowKey: v.string(),
    count: v.float64(),
    windowStartAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_user_window', ['userId', 'windowKey']),

  transactions: defineTable({
    userId: v.optional(v.string()),
    amount: v.float64(),
    currency: v.union(v.literal('USD'), v.literal('EUR'), v.literal('KES'), v.literal('BTC'), v.literal('ETH'), v.literal('USDT')),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')),
    transactionType: v.union(v.literal('subscription'), v.literal('upgrade'), v.literal('downgrade'), v.literal('refund'), v.literal('api_credit')),
    paymentProvider: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    supabaseId: v.string(),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt']),

  paymentMethods: defineTable({
    userId: v.string(),
    methodType: v.union(v.literal('credit_card'), v.literal('crypto_wallet'), v.literal('mobile_money'), v.literal('bank_transfer')),
    provider: v.union(v.literal('Stripe'), v.literal('PayPal'), v.literal('Coinbase'), v.literal('Mpesa'), v.literal('Flutterwave')),
    tokenizedDetails: v.string(),
    isDefault: v.boolean(),
    addedAt: v.float64(),
  })
    .index('by_user', ['userId']),

  // ── MARKET SOURCES & INSTRUMENTS ─────────────────────────────────────────
  marketSources: defineTable({
    name: v.string(),
    sourceType,
    region: v.optional(v.string()),
    countries: v.optional(v.array(v.string())),
    assetClasses: v.array(v.string()),
    reliability: v.float64(),
    uptimePercent: v.optional(v.float64()),
    latencyMs: v.optional(v.float64()),
    licenseType: v.optional(v.string()),
    baseUrl: v.optional(v.string()),
    wsUrl: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    active: v.boolean(),
    requiresAuth: v.optional(v.boolean()),
    rateLimit: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_name', ['name'])
    .index('by_type', ['sourceType'])
    .index('by_active', ['active'])
    .index('by_region', ['region']),

  marketInstruments: defineTable({
    symbol: v.string(),
    canonicalSymbol: v.string(),
    baseAsset: v.string(),
    quoteAsset: v.string(),
    assetClass,
    marketType,
    sourceId: v.string(),
    exchange: v.optional(v.string()),
    contractSize: v.optional(v.float64()),
    tickSize: v.optional(v.float64()),
    minOrderSize: v.optional(v.float64()),
    expiresAt: v.optional(v.float64()),
    settlementAsset: v.optional(v.string()),
    sector: v.optional(v.string()),
    country: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_symbol', ['symbol'])
    .index('by_canonical_symbol', ['canonicalSymbol'])
    .index('by_source', ['sourceId'])
    .index('by_asset_class', ['assetClass'])
    .index('by_market_type', ['marketType']),

  // ── STREAMS & SNAPSHOTS ──────────────────────────────────────────────────
  marketStreams: defineTable({
    sourceId: v.string(),
    instrumentId: v.string(),
    channel: streamChannel,
    status: streamStatus,
    lastSequence: v.optional(v.float64()),
    lastMessageAt: v.optional(v.float64()),
    errorCount: v.optional(v.float64()),
    lastErrorAt: v.optional(v.float64()),
    lastErrorMsg: v.optional(v.string()),
    resyncCount: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_source_and_channel', ['sourceId', 'channel'])
    .index('by_status', ['status'])
    .index('by_last_message', ['lastMessageAt']),

  streamSnapshots: defineTable({
    sourceId: v.string(),
    instrumentId: v.string(),
    channel: streamChannel,
    payloadRef: v.string(),
    sequence: v.optional(v.float64()),
    checksum: v.optional(v.string()),
    tsUtc: v.float64(),
    createdAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_source_and_channel', ['sourceId', 'channel'])
    .index('by_ts', ['tsUtc']),

  streamMessages: defineTable({
    sourceId: v.string(),
    instrumentId: v.string(),
    channel: streamChannel,
    payloadRef: v.string(),
    sequence: v.optional(v.float64()),
    tsUtc: v.float64(),
    receivedAt: v.float64(),
    processingMs: v.optional(v.float64()),
    createdAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_source_and_channel', ['sourceId', 'channel'])
    .index('by_ts', ['tsUtc'])
    .index('by_sequence', ['sequence']),

  tickData: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    price: v.float64(),
    size: v.float64(),
    side: v.union(v.literal('buy'), v.literal('sell'), v.literal('unknown')),
    tradeId: v.optional(v.string()),
    isMakerOrder: v.optional(v.boolean()),
    tsUtc: v.float64(),
    receivedAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_instrument_ts', ['instrumentId', 'tsUtc'])
    .index('by_source_ts', ['sourceId', 'tsUtc']),

  ohlcvData: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    interval: v.union(
      v.literal('1m'), v.literal('3m'), v.literal('5m'), v.literal('15m'),
      v.literal('30m'), v.literal('1h'), v.literal('4h'), v.literal('1d'), v.literal('1w')
    ),
    open: v.float64(),
    high: v.float64(),
    low: v.float64(),
    close: v.float64(),
    volume: v.float64(),
    quoteVolume: v.optional(v.float64()),
    tradeCount: v.optional(v.float64()),
    tsUtc: v.float64(),
    isClosed: v.boolean(),
  })
    .index('by_instrument_interval', ['instrumentId', 'interval'])
    .index('by_instrument_interval_ts', ['instrumentId', 'interval', 'tsUtc'])
    .index('by_source', ['sourceId']),

  orderBookSnapshots: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    level: v.union(v.literal('l1'), v.literal('l2'), v.literal('l3')),
    bids: v.string(),
    asks: v.string(),
    sequence: v.optional(v.float64()),
    tsUtc: v.float64(),
    receivedAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_instrument_level', ['instrumentId', 'level'])
    .index('by_ts', ['tsUtc']),

  fundingRates: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    fundingRate: v.float64(),
    fundingTime: v.float64(),
    predictedRate: v.optional(v.float64()),
    tsUtc: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_instrument_ts', ['instrumentId', 'tsUtc']),

  openInterest: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    openInterest: v.float64(),
    openInterestValue: v.optional(v.float64()),
    tsUtc: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_instrument_ts', ['instrumentId', 'tsUtc']),

  liquidations: defineTable({
    instrumentId: v.string(),
    sourceId: v.string(),
    side: v.union(v.literal('long'), v.literal('short')),
    quantity: v.float64(),
    price: v.float64(),
    value: v.optional(v.float64()),
    tsUtc: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_instrument_ts', ['instrumentId', 'tsUtc'])
    .index('by_side', ['side']),

  // ── ONCHAIN DATA ─────────────────────────────────────────────────────────
  onchainMetrics: defineTable({
    assetId: v.string(),
    metricName: v.union(
      v.literal('active_addresses'), v.literal('transaction_count'),
      v.literal('large_transactions'), v.literal('exchange_inflow'),
      v.literal('exchange_outflow'), v.literal('nvt'), v.literal('sopr'),
      v.literal('mvrv'), v.literal('hash_rate'), v.literal('difficulty')
    ),
    value: v.float64(),
    source: v.string(),
    tsUtc: v.float64(),
  })
    .index('by_asset', ['assetId'])
    .index('by_asset_metric', ['assetId', 'metricName'])
    .index('by_ts', ['tsUtc']),

  // ── EVENTS & NEWS ────────────────────────────────────────────────────────
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(v.literal('macro'), v.literal('crypto'), v.literal('earnings'), v.literal('regulatory'), v.literal('other')),
    impact: impactType,
    status: eventStatus,
    coins: v.array(v.string()),
    symbols: v.array(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    location: v.optional(v.string()),
    startTsUtc: v.float64(),
    endTsUtc: v.optional(v.float64()),
    slug: v.string(),
    sourceUrl: v.optional(v.string()),
    sourceChecksum: v.optional(v.string()),
    notes: v.optional(v.string()),
    actualValue: v.optional(v.string()),
    forecastValue: v.optional(v.string()),
    previousValue: v.optional(v.string()),
    lastCheckedAt: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_category', ['category'])
    .index('by_country', ['country'])
    .index('by_impact', ['impact'])
    .index('by_slug', ['slug'])
    .index('by_start_ts', ['startTsUtc'])
    .index('by_status', ['status']),

  eventMeta: defineTable({
    eventId: v.string(), key: v.string(), value: v.string(),
  })
    .index('by_event', ['eventId'])
    .index('by_event_and_key', ['eventId', 'key']),

  newsFeed: defineTable({
    headline: v.string(),
    summary: v.optional(v.string()),
    sourceId: v.string(),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    coins: v.array(v.string()),
    symbols: v.array(v.string()),
    categories: v.array(v.string()),
    sentiment: v.optional(v.union(v.literal('positive'), v.literal('negative'), v.literal('neutral'))),
    sentimentScore: v.optional(v.float64()),
    publishedAt: v.float64(),
    fetchedAt: v.float64(),
    isBreaking: v.optional(v.boolean()),
  })
    .index('by_source', ['sourceId'])
    .index('by_published_at', ['publishedAt'])
    .index('by_sentiment', ['sentiment'])
    .index('by_breaking', ['isBreaking']),

  eventSources: defineTable({
    name: v.string(), sourceType, baseUrl: v.optional(v.string()),
    reliability: v.float64(), region: v.optional(v.string()),
  })
    .index('by_name', ['name'])
    .index('by_type', ['sourceType']),

  eventSourceMap: defineTable({
    eventId: v.string(), sourceId: v.string(),
  })
    .index('by_event', ['eventId'])
    .index('by_source', ['sourceId']),

  eventSubscriptions: defineTable({
    userId: v.string(), eventId: v.string(),
    channels: v.array(v.string()), leadTimes: v.array(v.float64()),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_event', ['eventId'])
    .index('by_user_and_event', ['userId', 'eventId']),

  // ── SIGNALS & AI ─────────────────────────────────────────────────────────
  signals: defineTable({
    instrumentId: v.string(),
    sourceId: v.optional(v.string()),
    signalType,
    direction: v.union(v.literal('bullish'), v.literal('bearish'), v.literal('neutral')),
    strength: v.float64(),
    confidence: v.optional(v.float64()),
    timeframe: v.optional(v.string()),
    entryPrice: v.optional(v.float64()),
    targetPrice: v.optional(v.float64()),
    stopLoss: v.optional(v.float64()),
    metadata: v.optional(v.string()),
    expiresAt: v.optional(v.float64()),
    tsUtc: v.float64(),
    createdAt: v.float64(),
  })
    .index('by_instrument', ['instrumentId'])
    .index('by_type', ['signalType'])
    .index('by_direction', ['direction'])
    .index('by_ts', ['tsUtc']),

  aiFeatures: defineTable({
    featureName: v.string(),
    featureType: v.union(v.literal('prediction'), v.literal('market_update'), v.literal('signal'), v.literal('summarizer'), v.literal('screener')),
    description: v.optional(v.string()),
    endpointUrl: v.string(),
    modelName: v.optional(v.string()),
    requiredAccessLevel: accessLevel,
    isActive: v.boolean(),
    supabaseFeatureId: v.string(),
  })
    .index('by_feature_type', ['featureType'])
    .index('by_active', ['isActive']),

  userAiAccess: defineTable({
    userId: v.string(), aiFeatureId: v.string(),
    accessGranted: v.boolean(), grantedAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_feature', ['aiFeatureId'])
    .index('by_user_and_feature', ['userId', 'aiFeatureId']),

  aiOutputs: defineTable({
    featureId: v.string(),
    userId: v.optional(v.string()),
    instrumentId: v.optional(v.string()),
    input: v.optional(v.string()),
    output: v.string(),
    model: v.optional(v.string()),
    latencyMs: v.optional(v.float64()),
    tokensUsed: v.optional(v.float64()),
    createdAt: v.float64(),
  })
    .index('by_feature', ['featureId'])
    .index('by_user', ['userId'])
    .index('by_instrument', ['instrumentId']),

  // ── ALERTS & WATCHLISTS ──────────────────────────────────────────────────
  alerts: defineTable({
    userId: v.string(),
    instrumentId: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    type: alertCondition,
    conditionConfig: v.string(),
    deliveryChannels: v.array(v.string()),
    cooldownSeconds: v.optional(v.float64()),
    lastTriggeredAt: v.optional(v.float64()),
    triggerCount: v.optional(v.float64()),
    isActive: v.boolean(),
    expiresAt: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_instrument', ['instrumentId'])
    .index('by_type', ['type'])
    .index('by_active', ['isActive']),

  alertDeliveries: defineTable({
    alertId: v.string(),
    userId: v.string(),
    channel: v.string(),
    payload: v.string(),
    status: v.union(v.literal('pending'), v.literal('sent'), v.literal('failed')),
    sentAt: v.optional(v.float64()),
    errorMsg: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index('by_alert', ['alertId'])
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  watchlists: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    color: v.optional(v.string()),
    sortOrder: v.optional(v.float64()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_name', ['userId', 'name']),

  watchlistItems: defineTable({
    watchlistId: v.string(),
    instrumentId: v.string(),
    notes: v.optional(v.string()),
    addedAt: v.float64(),
  })
    .index('by_watchlist', ['watchlistId'])
    .index('by_instrument', ['instrumentId']),

  // ── SOCIAL & COMMUNITY ───────────────────────────────────────────────────
  follows: defineTable({
    userId: v.string(),
    targetType: v.union(v.literal('coin'), v.literal('symbol'), v.literal('country'), v.literal('category'), v.literal('watchlist'), v.literal('user')),
    targetId: v.string(),
    createdAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_target', ['targetType', 'targetId'])
    .index('by_user_target', ['userId', 'targetType', 'targetId']),

  userLayouts: defineTable({
    userId: v.string(),
    name: v.string(),
    config: v.string(),
    isDefault: v.optional(v.boolean()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index('by_user', ['userId']),

  // ── NOTIFICATIONS ────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.optional(v.string()),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    notificationType: v.union(v.literal('email'), v.literal('in_app'), v.literal('push'), v.literal('sms'), v.literal('webhook')),
    referenceType: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    isRead: v.boolean(),
    sentAt: v.float64(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_read', ['userId', 'isRead']),

  // ── VERIFICATION & KYC ──────────────────────────────────────────────────
  userVerifications: defineTable({
    userId: v.optional(v.string()),
    verificationType: v.union(v.literal('proof_of_address'), v.literal('id_document'), v.literal('analyst_certification'), v.literal('accredited_investor')),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    documentUrl: v.string(),
    submittedAt: v.float64(),
    reviewedAt: v.optional(v.float64()),
    reviewNotes: v.optional(v.string()),
    supabaseId: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  subscriptionFeatures: defineTable({
    featureName: v.string(),
    description: v.optional(v.string()),
    supabaseFeatureId: v.string(),
  })
    .index('by_feature_name', ['featureName']),

  subscriptionTiers: defineTable({
    tierName: v.union(v.literal('Basic'), v.literal('Premium'), v.literal('VIP')),
    monthlyPrice: v.float64(),
    description: v.optional(v.string()),
    subaseTierId: v.string(),
    createdAt: v.float64(),
  })
    .index('by_tier_name', ['tierName']),

  tierFeatureMap: defineTable({
    tierId: v.string(), featureId: v.string(),
  })
    .index('by_tier', ['tierId'])
    .index('by_feature', ['featureId']),
});