# FINHUBAFRICA — Complete Gap Analysis & Implementation Checklist

> **Generated:** 2026-06-05
> **Platform:** FINHUBAFRICA — Africa's #1 Crypto & Forex Trading Platform
> **Status:** Pre-production prototype with extensive UI scaffolding, no live transactions

---

## EXECUTIVE SUMMARY

The platform is a **sophisticated UI prototype** with 30+ routes, 1089-line database schema, 50+ Convex tables, and 12+ market data source adapters. However, nearly every feature is **simulated with hardcoded mock data**. No real trading, payment processing, KYC/AML, or working data pipelines exist yet.

### Critical Findings

| Area | Status |
|------|--------|
| UI Pages & Navigation | ⚠️ ~60% complete — Beautiful UI, but all routes public |
| Authentication (Clerk) | ⚠️ Partially wired — No route protection applied |
| Convex Backend/Schema | ✅ ~70% — Comprehensive schema, many query stubs |
| Real Trading | ❌ Not implemented — All trading is simulated |
| Payment Processing | ❌ Not implemented — No Stripe/M-Pesa integration |
| KYC/AML Compliance | ❌ Not implemented — No identity verification |
| Market Data Feeds | ⚠️ ~40% — WebSocket adapters built, no live API keys |
| AI/ML Features | ❌ Stubs only — No model inference running |
| Social/Copy Trading | ❌ Hardcoded mock data — No real follow/copy logic |
| Alert System | ⚠️ ~50% — Schema complete, evaluation logic basic |
| Mobile Money (M-Pesa) | ❌ UI only — No Daraja API integration |
| P2P Marketplace | ❌ UI only — No escrow or order matching |
| Vault/Earn Features | ❌ UI only — No DeFi staking integration |
| Events & News | ⚠️ ~40% — Schema exists, CoinGecko calls fail (CORS) |
| Admin Dashboard | ❌ Stubbed — No real admin operations |

---

## PHASE 1: CRITICAL SECURITY & AUTHENTICATION (Priority: 🔴 URGENT) ✅ COMPLETED

### 1.1 Route Protection ✅
- [x] Apply `<ProtectedRoute>` wrapper to all authenticated routes in `src/App.tsx`
- [x] Protect `/dashboard`, `/trading`, `/vault`, `/portfolio`, `/alerts`, `/signals`
- [x] Protect `/admin`, `/roles`, `/admin/infrastructure` with admin role check
- [x] Add 404 catch-all route with proper error page
- [x] Implement `roleMiddleware` — verify user has required role before rendering
- [x] Add ErrorBoundary component wrapping all routes to prevent full-app crashes
- [x] Implement scroll-to-top on route change
- [x] Add route-level code splitting (React.lazy + Suspense) for performance

### 1.2 Authentication Hardening (Partial)
- [ ] Remove development Clerk keys from production builds
- [ ] Enforce email verification before allowing dashboard access
- [x] Implement session timeout after 30 minutes of inactivity
- [ ] Add CSRF protection on all mutation endpoints
- [ ] Rate-limit login attempts (5 per minute per IP)
- [ ] Implement account lockout after 10 failed attempts
- [ ] Add multi-factor authentication (MFA) support via Clerk
- [x] Audit `useAuth` hook — ensure `signOut` properly clears all tokens

### 1.3 Authorization & Access Control
- [ ] Implement row-level security on all Convex queries (users can only read their own data)
- [ ] Enforce `checkAccess` entitlement checks on premium features
- [ ] Implement API key validation for TradingView webhook endpoints
- [ ] Add admin-only guards on `convex/admin.ts` functions
- [ ] Verify `userRoles` table is enforced on all role-gated endpoints

---

## PHASE 2: BACKEND DATA PIPELINE (Priority: 🔴 CRITICAL)

### 2.1 Database Schema Completion
- [ ] Review all 50+ tables in `convex/schema.ts` — remove or finalize unused tables
- [ ] Add missing indexes for frequently queried fields
- [ ] Implement foreign key constraints between related tables
- [ ] Add created/updated timestamps to all tables
- [ ] Verify `canonicalInstruments` table has proper unique constraints on symbol+venue
- [ ] Ensure `userSubscriptions` properly links to Clerk user IDs
- [ ] Add soft-delete support for user accounts (GDPR compliance)

### 2.2 Market Data Ingestion Pipeline
- [ ] **Source Connectors** — Get live API keys for:
  - [ ] CoinGecko API (currently blocked by CORS — needs server-side proxy)
  - [ ] CoinMarketCap API
  - [ ] Alpha Vantage (forex)
  - [ ] Finnhub (stocks + forex)
  - [ ] Yahoo Finance
  - [ ] Polygon.io
  - [ ] CoinAPI
- [ ] **WebSocket Adapters** — Connect live feeds:
  - [ ] Binance WebSocket (`convex/ingestion/adapters/binance.ts`)
  - [ ] Coinbase WebSocket (`convex/ingestion/adapters/coinbase.ts`)
  - [ ] Kraken WebSocket (`convex/ingestion/adapters/kraken.ts`)
- [ ] **Redis Buffer** — Verify `convex/ingestion/redisBuffer.ts` connects to Redis
- [ ] **Bootstrap** — Implement data backfill for historical OHLCV data
- [ ] **WS Optimizer** — Ensure `convex/ingestion/wsOptimizer.ts` handles reconnection
- [ ] **Data Normalization** — Verify all sources feed into `canonicalInstruments` format
- [ ] **Connection Health** — Implement `exchangeConnections` monitoring in Convex

### 2.3 Real-time Price Updates
- [ ] Wire `MarketDataContext` to live WebSocket data instead of CoinGecko
- [ ] Implement price caching layer to reduce API calls
- [ ] Add stale data detection (alert if price hasn't updated in 30s)
- [ ] Implement multi-source aggregation with failover
- [ ] Add price deviation detection (flag suspicious moves >5% in 1 min)

---

## PHASE 3: TRADING ENGINE (Priority: 🟠 HIGH)

### 3.1 TradingView Webhook Integration
- [ ] `convex/tradingview/http.ts` — Validate HMAC signatures on incoming signals
- [ ] `convex/tradingview/payloadParser.ts` — Parse TradingView alert messages into structured signals
- [ ] `convex/tradingview/orderMapper.ts` — Map parsed signals to exchange order types (market/limit/stop)
- [ ] `convex/tradingview/riskControls.ts` — Implement:
  - [ ] Max position size limit per trade
  - [ ] Daily loss limit
  - [ ] Max concurrent positions
  - [ ] Drawdown circuit breaker
- [ ] `convex/tradingview/exchanges/executor.ts` — Implement order execution:
  - [ ] Binance API integration
  - [ ] Coinbase Advanced Trade API
  - [ ] Kraken API
- [ ] `convex/tradingview/api.ts` — Secure API key storage per exchange
- [ ] Implement order status tracking (pending → filled/cancelled/failed)
- [ ] Add fill reconciliation — verify execution vs. signal intent

### 3.2 Portfolio Management
- [ ] `convex/` portfolio queries — Wire to real exchange accounts
- [ ] Implement real-time portfolio valuation using live prices
- [ ] Add position history tracking with P&L calculation
- [ ] Implement fee tracking across all exchanges
- [ ] Add portfolio performance attribution (by asset, by strategy, by time)
- [ ] Create CSV/PDF export of trade history
- [ ] Implement multi-currency conversion (USD ↔ KES ↔ NGN ↔ GHS)

### 3.3 Order Book & Depth Chart
- [ ] `src/components/market/OrderBookDepth.tsx` — Connect to live order book data
- [ ] Implement bid/ask level 2 data from WebSocket feeds
- [ ] Add depth visualization with cumulative volume
- [ ] Implement spread monitoring alerts

---

## PHASE 4: SIGNALS & AI INTELLIGENCE (Priority: 🟠 HIGH)

### 4.1 Technical Analysis Signals
All 13 signal modules exist in `convex/signals/` — verify each is fully implemented:

- [ ] `rsiOversold.ts` — RSI < 30 detection with configurable threshold
- [ ] `rsiOverbought.ts` — RSI > 70 detection
- [ ] `rsiBullish.ts` — RSI bullish crossover signal
- [ ] `rsiNeutral.ts` — RSI in neutral zone
- [ ] `rsiTrend.ts` — RSI trend identification
- [ ] `rsiMomentum.ts` — RSI momentum analysis
- [ ] `rsiDivergenceBullish.ts` — Bullish divergence (price down, RSI up)
- [ ] `rsiDivergenceBearish.ts` — Bearish divergence (price up, RSI down)
- [ ] `macdCrossover.ts` — MACD signal/trigger line crossover
- [ ] `volumeBreakout.ts` — Volume spike breakout detection
- [ ] `liquidationCascade.ts` — Liquidation cascade detection
- [ ] `oiDivergence.ts` — Open interest divergence from price
- [ ] `crossExchangeSpread.ts` — Cross-exchange arbitrage opportunities
- [ ] `arbSignal.ts` — Arbitrage signal aggregation

**For each signal, verify:**
- [ ] Correct mathematical implementation
- [ ] Backtesting with historical data
- [ ] Signal quality scoring
- [ ] False positive rate < 40%
- [ ] Convex query for fetching signals
- [ ] Frontend visualization via `src/components/signals/SignalFeed.tsx`

### 4.2 AI/NVIDIA Integration
- [ ] `src/services/nvidiaService.ts` — Connect to NVIDIA NIM API
- [ ] `src/hooks/useNvidiaAI.ts` — Implement real inference calls
- [ ] `src/components/NvidiaAIPanel.tsx` — Show AI predictions with confidence scores
- [ ] `convex/` aiFeatures/aiOutputs/aiRuns tables — Wire to real model outputs
- [ ] Implement model versioning and A/B testing
- [ ] Add AI explanation/provenance tracking (`src/components/ai/AIProvenancePanel.tsx`)

### 4.3 Alert System
- [ ] `convex/alerts/evaluator.ts` — Implement alert condition evaluation against live data
- [ ] `convex/alerts/deduplicator.ts` — Prevent duplicate alerts within time window
- [ ] `convex/alerts/dispatcher.ts` — Send alerts via:
  - [ ] Email (SendGrid/Resend)
  - [ ] SMS (Twilio/Africa's Talking)
  - [ ] Push notifications (Firebase FCM)
  - [ ] In-app notification center
- [ ] `convex/alerts/conditions.ts` — Implement all condition types:
  - [ ] Price above/below threshold
  - [ ] Percentage change in time window
  - [ ] Technical indicator trigger
  - [ ] Volume spike
  - [ ] Cross-exchange spread threshold
- [ ] `src/components/alerts/AlertManager.tsx` — Connect to real alert CRUD

---

## PHASE 5: PAYMENT PROCESSING (Priority: 🟠 HIGH)

### 5.1 Stripe Integration
- [ ] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
- [ ] Implement Stripe Checkout for subscription payments
- [ ] `convex/subscriptions.ts` — Wire to Stripe webhooks for:
  - [ ] `checkout.session.completed` → Activate subscription
  - [ ] `invoice.paid` → Extend subscription period
  - [ ] `invoice.payment_failed` → Suspend account
  - [ ] `customer.subscription.deleted` → Deactivate subscription
- [ ] Implement subscription upgrade/downgrade with proration
- [ ] Add billing portal for users to manage payment methods
- [ ] Implement refund handling

### 5.2 M-Pesa / Mobile Money Integration
- [ ] Implement Daraja API integration for:
  - [ ] C2B (Customer to Business) — User deposits via M-Pesa
  - [ ] B2C (Business to Customer) — Withdrawals to M-Pesa
  - [ ] STK Push — In-app payment prompt
- [ ] Add support for:
  - [ ] MTN Mobile Money (Ghana, Uganda)
  - [ ] Airtel Money (Kenya, Tanzania)
  - [ ] OPay (Nigeria)
  - [ ] MTN MoMo (Nigeria)
- [ ] Implement transaction reconciliation with Convex `transactions` table
- [ ] Add payment status polling and webhook handling
- [ ] Implement minimum/maximum deposit limits per country
- [ ] Add transaction fee calculation per payment method

### 5.3 Deposit/Withdrawal Flow
- [ ] Implement KYC-gated deposit limits:
  - [ ] Tier 1 (No KYC): Max $100/day
  - [ ] Tier 2 (ID verified): Max $1,000/day
  - [ ] Tier 3 (Full KYC): Unlimited
- [ ] Add fiat ↔ crypto conversion using live rates
- [ ] Implement withdrawal processing queue
- [ ] Add anti-money laundering (AML) transaction monitoring
- [ ] Create transaction history page with export

---

## PHASE 6: KYC/AML COMPLIANCE (Priority: 🔴 URGENT)

### 6.1 Identity Verification
- [ ] Integrate verification provider (Sumsub, Onfido, or Smile ID — Africa-focused)
- [ ] Implement document upload (passport, national ID, driver's license)
- [ ] Add selfie/liveness check
- [ ] Store verification status in `users` table
- [ ] Implement verification review workflow (auto-approve + manual review queue)

### 6.2 AML Monitoring
- [ ] Implement transaction velocity checks
- [ ] Add sanctions screening (OFAC, UN, EU lists)
- [ ] Implement suspicious activity reports (SAR) workflow
- [ ] Add PEP (Politically Exposed Persons) screening
- [ ] Implement configurable risk scoring per transaction

### 6.3 Data Privacy
- [ ] Implement data retention policies (GDPR, Nigeria NDPR)
- [ ] Add right to data export (JSON format)
- [ ] Add right to data deletion
- [ ] Implement data encryption at rest for PII
- [ ] Add consent management for marketing communications
- [ ] Create privacy settings page

---

## PHASE 7: P2P MARKETPLACE (Priority: 🟡 MEDIUM)

- [ ] Implement order book for buy/sell ads
- [ ] Add escrow system for trade protection
- [ ] Implement chat between buyer/seller
- [ ] Add payment method matching (M-Pesa ↔ bank, etc.)
- [ ] Implement reputation/feedback system
- [ ] Add dispute resolution workflow
- [ ] Implement auto-release after payment confirmation
- [ ] Add trade limits based on KYC level
- [ ] Wire `src/pages/p2p/P2PMarketplace.tsx` to real data

---

## PHASE 8: SOCIAL & COPY TRADING (Priority: 🟡 MEDIUM)

- [ ] Implement real follow/unfollow logic (replace hardcoded `isFollowing`)
- [ ] Add trade copy execution — when leader trades, auto-copy for followers
- [ ] Implement performance tracking per trader
- [ ] Add leaderboard ranking by verified P&L
- [ ] Implement trade feed from real positions
- [ ] Add risk-based copy scaling (follower controls position size ratio)
- [ ] Wire `src/pages/social/SocialTrading.tsx` to Convex data
- [ ] Add privacy controls (hide trades from non-followers)

---

## PHASE 9: VAULT & EARN (Priority: 🟡 MEDIUM)

### 9.1 Crypto Vault (Staking/DeFi)
- [ ] Integrate staking provider (e.g., Kiln, Staked, Allnodes)
- [ ] Implement staking APY calculation
- [ ] Add lock-up period configuration
- [ ] Implement reward distribution tracking
- [ ] Wire `src/pages/vault/VaultPage.tsx` to real staking data

### 9.2 Learn & Earn
- [ ] Create educational content library
- [ ] Implement quiz/assessment system
- [ ] Add reward tracking for completed courses
- [ ] Implement certificate generation
- [ ] Wire `src/pages/learn/LearnAndEarn.tsx` to real content

### 9.3 Recurring Buys (DCA)
- [ ] Implement real recurring buy scheduling
- [ ] Connect to fiat on-ramp for automated purchases
- [ ] Add buy execution at scheduled times using live prices
- [ ] Implement DCA performance tracking vs. lump sum
- [ ] Wire `src/pages/recurring/RecurringBuys.tsx` to real plans

---

## PHASE 10: EVENTS & NEWS (Priority: 🟡 MEDIUM)

### 10.1 Events Calendar
- [ ] Replace CoinGecko direct calls with server-side proxy (fix CORS)
- [ ] Add real crypto event data sources
- [ ] Implement event filtering by category
- [ ] Add event impact scoring (high/medium/low)
- [ ] Wire `src/pages/Events.tsx` and `src/components/EventsCalendarView.tsx`

### 10.2 News Feed
- [ ] Integrate crypto news API (CoinDesk, CoinTelegraph)
- [ ] Implement NLP sentiment analysis on news
- [ ] Add news → price impact correlation
- [ ] Create news feed component with categorization

---

## PHASE 11: SUBSCRIPTION & MONETIZATION (Priority: 🟡 MEDIUM)

### 11.1 Subscription Plans
- [ ] `convex/subscriptions.ts` — Implement full subscription CRUD
- [ ] `convex/entitlements/checkAccess.ts` — Wire entitlement checks to all premium features
- [ ] Implement feature gating by tier:
  - [ ] Free: Basic market data, 3 alerts, 1 watchlist
  - [ ] Pro ($19/mo): All signals, unlimited alerts, 10 watchlists, P2P
  - [ ] Premium ($49/mo): AI predictions, copy trading, advanced charts
  - [ ] Institutional: Custom limits, API access, priority support
- [ ] Implement trial period (7-day free for Pro)
- [ ] Add referral program with reward tracking
- [ ] Wire `src/pages/Subscriptions.tsx` to real subscription management

---

## PHASE 12: PERFORMANCE & INFRASTRUCTURE (Priority: 🟡 MEDIUM)

### 12.1 Frontend Performance
- [ ] Implement React.lazy + Suspense for all route components
- [ ] Add virtual scrolling for large lists (trades, order book, positions)
- [ ] Implement service worker for offline caching of static assets
- [ ] Optimize bundle size — analyze with `vite-bundle-analyzer`
- [ ] Add image optimization (WebP, lazy loading)
- [ ] Implement prefetching for likely next pages

### 12.2 Backend Performance
- [ ] Add Convex query result caching where appropriate
- [ ] Implement database connection pooling
- [ ] Add query pagination for all list endpoints
- [ ] Optimize Convex function memoization
- [ ] Implement rate limiting per user tier

### 12.3 DevOps & Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Implement application monitoring (Datadog/Grafana)
- [ ] Add structured logging across all backend functions
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Implement automated testing:
  - [ ] Unit tests for all Convex functions
  - [ ] Integration tests for TradingView webhook handling
  - [ ] E2E tests for critical user flows (signup → deposit → trade → withdraw)
- [ ] Add environment-based configuration (dev/staging/production)
- [ ] Implement database backup strategy

---

## PHASE 13: MOBILE & RESPONSIVE DESIGN (Priority: 🟢 LOW)

- [ ] Test all pages on mobile viewport (375px width)
- [ ] Fix `Navigation.tsx` → `MobileNavigation.tsx` responsive breakpoint
- [ ] Implement bottom navigation bar for mobile
- [ ] Add touch gestures for chart interactions (pinch, swipe)
- [ ] Implement push notifications for mobile
- [ ] Add PWA manifest for install-to-homescreen
- [ ] Test on Android Chrome, iOS Safari, Samsung Internet

---

## PHASE 14: ADMIN DASHBOARD (Priority: 🟢 LOW)

- [ ] `src/pages/RoleManagement.tsx` — Wire to real user/role CRUD
- [ ] `convex/admin.ts` — Implement all admin operations:
  - [ ] User management (view, suspend, delete)
  - [ ] Subscription management
  - [ ] System health monitoring
  - [ ] Audit log viewer
- [ ] `src/components/admin/StreamHealthMonitor.tsx` — Connect to real WebSocket health data
- [ ] `src/components/admin/DataSourceTrustPanel.tsx` — Wire to real source reliability metrics
- [ ] Implement admin activity logging
- [ ] Add system configuration panel

---

## PHASE 15: TESTING & QA (Priority: 🟠 HIGH)

### Critical Bugs to Fix First
- [ ] `TabsContent` nesting error in `RecurringBuys.tsx` ✅ FIXED
- [ ] `user.email` TypeScript error in `Navigation.tsx` ✅ FIXED
- [ ] CoinGecko CORS errors — implement server-side proxy
- [ ] WebSocket disconnect/reconnect logic
- [ ] HMR errors when editing `SocialTrading.tsx`

### Test Coverage Needed
- [ ] Auth flow tests (signup, login, logout, password reset)
- [ ] Subscription flow tests (create, upgrade, cancel, payment failure)
- [ ] Signal generation tests (all 13 signal types)
- [ ] Alert system tests (create, evaluate, deduplicate, dispatch)
- [ ] TradingView webhook tests (parse, validate, execute)
- [ ] Payment integration tests (deposit, withdraw, reconciliation)
- [ ] Market data tests (connect, parse, normalize, aggregate)

---

## IMPLEMENTATION PRIORITY MATRIX

### 🔴 SPRINT 1 (Weeks 1-2): Security & Core Infrastructure
1. Route protection with `<ProtectedRoute>` on all routes
2. Admin role-based access control
3. ErrorBoundary component
4. 404 page
5. Remove dev Clerk keys from production
6. Fix all existing TypeScript errors

### 🟠 SPRINT 2 (Weeks 3-4): Data Pipeline
1. Get live API keys for market data sources
2. Server-side proxy for CoinGecko (fix CORS)
3. Wire WebSocket adapters to live feeds
4. Implement price caching layer
5. Market data context → live data
6. Historical data backfill

### 🟠 SPRINT 3 (Weeks 5-6): Payments & Subscriptions
1. Stripe integration for subscriptions
2. M-Pesa Daraja API integration
3. Subscription management CRUD
4. Entitlement enforcement on all premium features
5. Transaction history & reporting

### 🟠 SPORT 4 (Weeks 7-8): Trading & Signals
1. TradingView webhook HMAC validation
2. Exchange API key management
3. Order execution pipeline (Binance, Coinbase)
4. Signal quality verification
5. Alert system wiring to live data

### 🟡 SPRINT 5 (Weeks 9-10): KYC & Compliance
1. Identity verification provider integration
2. AML transaction monitoring
3. KYC-gated deposit limits
4. Privacy/data retention
5. Audit logging

### 🟡 SPRINT 6 (Weeks 11-12): Social Features & Polish
1. Real follow/copy trading logic
2. P2P marketplace escrow
3. Vault staking integration
4. Performance optimization (code splitting, caching)
5. Mobile responsive fixes
6. E2E test suite

---

## QUICK REFERENCE: FILES NEEDING IMMEDIATE ATTENTION

| File | Issue | Priority |
|------|-------|----------|
| `src/App.tsx` | No route protection, no 404, no code splitting | 🔴 |
| `src/components/ProtectedRoute.tsx` | Exists but never used | 🔴 |
| `src/hooks/useAuth.tsx` | Missing MFA, session timeout | 🔴 |
| `convex/auth.ts` | Needs role enforcement | 🔴 |
| `convex/subscriptions.ts` | No Stripe webhooks | 🟠 |
| `src/services/nvidiaService.ts` | Placeholder — no real API calls | 🟠 |
| `src/services/marketData/` | All source adapters need real API keys | 🟠 |
| `convex/tradingview/exchanges/executor.ts` | No real exchange connectivity | 🟠 |
| `convex/alerts/evaluator.ts` | Needs live data pipeline | 🟠 |
| `src/pages/p2p/P2PMarketplace.tsx` | All mock data | 🟡 |
| `src/pages/vault/VaultPage.tsx` | All mock data | 🟡 |
| `src/pages/social/SocialTrading.tsx` | All mock data | 🟡 |
| `src/pages/mobile-money/MobileMoney.tsx` | No Daraja API integration | 🟡 |
| `src/pages/Events.tsx` | CoinGecko CORS blocking | 🟡 |
| `convex/schema.ts` | 1089 lines — needs review for unused tables | 🟡 |