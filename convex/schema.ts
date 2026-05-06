import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema — migrated from Supabase PostgreSQL cluster backup
 * Source: db_cluster-20-09-2025_06-25-47_backup.gz
 *
 * PostgreSQL → Convex mapping decisions:
 *  - uuid PKs are replaced by Convex's built-in `_id` (Id<"table">)
 *  - Legacy uuid foreign keys are stored as plain `string` fields so existing
 *    Supabase IDs survive the migration; switch to Id<"table"> after a full
 *    data re-import if you want typed Convex references.
 *  - TIMESTAMPTZ / TIMESTAMP → number (Unix ms via Date.getTime())
 *  - PostgreSQL ENUMs → v.union(v.literal(...)) validators
 *  - JSONB arrays (e.g. plan features) → v.array(v.string())
 *  - DECIMAL(n,m) → v.number()
 *  - boolean → v.boolean()
 *  - text[] / character varying[] arrays → v.array(v.string())
 *  - integer[] arrays → v.array(v.number())
 *  - Tables with 0 rows but important structure are included for completeness.
 *  - Auth (auth.*) and infrastructure tables (realtime.*, storage.*) are
 *    intentionally omitted – Convex handles auth natively.
 */

// ─── Shared enum validators ───────────────────────────────────────────────────

const eventCategory = v.union(
  v.literal("macro"),
  v.literal("crypto"),
  v.literal("earnings"),
  v.literal("other")
);

const eventStatus = v.union(
  v.literal("scheduled"),
  v.literal("tentative"),
  v.literal("postponed"),
  v.literal("canceled"),
  v.literal("complete")
);

const impactLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export default defineSchema({
  users: defineTable({
    supabaseUserId: v.string(),
    email: v.string(),
    passwordHash: v.optional(v.string()),
    signInMethod: v.union(
      v.literal("email"),
      v.literal("google"),
      v.literal("apple"),
      v.literal("facebook")
    ),
    subscriptionTierId: v.optional(v.string()),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_supabase_id", ["supabaseUserId"]),

  roles: defineTable({
    roleName: v.string(),
  }).index("by_role_name", ["roleName"]),

  userRoles: defineTable({
    userId: v.string(),
    roleName: v.string(),
    assignedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["roleName"])
    .index("by_user_and_role", ["userId", "roleName"]),

  subscriptionPlans: defineTable({
    supabasePlanId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    priceMonthly: v.number(),
    priceYearly: v.number(),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  subscriptionTiers: defineTable({
    subaseTierId: v.string(),
    tierName: v.union(
      v.literal("Basic"),
      v.literal("Premium"),
      v.literal("VIP")
    ),
    monthlyPrice: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tier_name", ["tierName"]),

  subscriptionFeatures: defineTable({
    supabaseFeatureId: v.string(),
    featureName: v.string(),
    description: v.optional(v.string()),
  }).index("by_feature_name", ["featureName"]),

  tierFeatureMap: defineTable({
    tierId: v.string(),
    featureId: v.string(),
  })
    .index("by_tier", ["tierId"])
    .index("by_feature", ["featureId"]),

  userSubscriptions: defineTable({
    supabaseId: v.string(),
    userId: v.string(),
    planId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete")
    ),
    billingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    stripeSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_plan", ["planId"])
    .index("by_status", ["status"])
    .index("by_stripe_id", ["stripeSubscriptionId"]),

  featureAccess: defineTable({
    supabaseId: v.string(),
    userId: v.string(),
    featureName: v.string(),
    accessLevel: v.union(
      v.literal("basic"),
      v.literal("advanced"),
      v.literal("full")
    ),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_feature", ["userId", "featureName"]),

  aiFeatures: defineTable({
    supabaseFeatureId: v.string(),
    featureName: v.string(),
    endpointUrl: v.string(),
    featureType: v.union(
      v.literal("prediction"),
      v.literal("market_update"),
      v.literal("signal")
    ),
    description: v.optional(v.string()),
  }).index("by_feature_type", ["featureType"]),

  userAiAccess: defineTable({
    userId: v.string(),
    aiFeatureId: v.string(),
    accessGranted: v.boolean(),
    grantedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_feature", ["aiFeatureId"])
    .index("by_user_and_feature", ["userId", "aiFeatureId"]),

  events: defineTable({
    supabaseId: v.string(),
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: eventCategory,
    symbols: v.array(v.string()),
    coins: v.array(v.string()),
    country: v.optional(v.string()),
    location: v.optional(v.string()),
    startTsUtc: v.number(),
    endTsUtc: v.optional(v.number()),
    impact: impactLevel,
    status: eventStatus,
    sourceUrl: v.optional(v.string()),
    sourceChecksum: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastCheckedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_impact", ["impact"])
    .index("by_start_ts", ["startTsUtc"])
    .index("by_country", ["country"]),

  eventSources: defineTable({
    supabaseId: v.number(),
    name: v.string(),
    baseUrl: v.optional(v.string()),
    reliability: v.number(),
  }).index("by_name", ["name"]),

  eventSourceMap: defineTable({
    supabaseId: v.number(),
    eventId: v.string(),
    sourceId: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_source", ["sourceId"]),

  eventMeta: defineTable({
    supabaseId: v.number(),
    eventId: v.string(),
    key: v.string(),
    value: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_and_key", ["eventId", "key"]),

  eventSubscriptions: defineTable({
    supabaseId: v.string(),
    userId: v.string(),
    eventId: v.string(),
    channels: v.array(v.string()),
    leadTimes: v.array(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_and_event", ["userId", "eventId"]),

  follows: defineTable({
    supabaseId: v.string(),
    userId: v.string(),
    category: v.optional(eventCategory),
    symbol: v.optional(v.string()),
    coin: v.optional(v.string()),
    country: v.optional(v.string()),
    impact: v.optional(impactLevel),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_symbol", ["symbol"])
    .index("by_coin", ["coin"]),

  notifications: defineTable({
    supabaseId: v.string(),
    userId: v.optional(v.string()),
    notificationType: v.union(v.literal("email"), v.literal("in_app")),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    isRead: v.boolean(),
    sentAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  paymentMethods: defineTable({
    supabaseId: v.string(),
    userId: v.optional(v.string()),
    provider: v.union(
      v.literal("Stripe"),
      v.literal("PayPal"),
      v.literal("Coinbase")
    ),
    methodType: v.union(
      v.literal("credit_card"),
      v.literal("crypto_wallet")
    ),
    tokenizedDetails: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    supabaseId: v.string(),
    userId: v.optional(v.string()),
    amount: v.number(),
    currency: v.union(
      v.literal("USD"),
      v.literal("EUR"),
      v.literal("BTC"),
      v.literal("ETH")
    ),
    transactionType: v.union(
      v.literal("subscription"),
      v.literal("upgrade"),
      v.literal("downgrade"),
      v.literal("refund")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    paymentProvider: v.optional(v.string()),
    transactionReference: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  userVerifications: defineTable({
    supabaseId: v.string(),
    userId: v.optional(v.string()),
    verificationType: v.union(
      v.literal("proof_of_address"),
      v.literal("id_document"),
      v.literal("analyst_certification")
    ),
    documentUrl: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
