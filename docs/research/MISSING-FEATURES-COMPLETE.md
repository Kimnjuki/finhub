# FinHub Africa — Complete Missing Features Checklist
> **Generated:** 2026-06-22
> **Purpose:** Comprehensive checklist of all missing features to implement

---

## 🔴 CRITICAL BLOCKERS (Must Have for Launch)

### Payments & Financial Infrastructure
- [ ] **M-Pesa Daraja API Integration** (`convex/payments/mpesa.ts`)
  - [ ] C2B (Customer to Business) - deposits
  - [ ] B2C (Business to Customer) - withdrawals
  - [ ] STK Push - in-app payment prompt
  - [ ] Transaction reconciliation with Convex
  - [ ] Webhook handling for payment status
  - [ ] Test in Safaricom sandbox

- [ ] **Paystack Integration** (Nigeria)
  - [ ] Card payments
  - [ ] Bank transfer
  - [ ] Mobile money (GT Pay, OPay)
  - [ ] Webhook handlers
  - [ ] Test in Paystack sandbox

- [ ] **Flutterwave Integration** (Africa-wide)
  - [ ] Card payments
  - [ ] M-Pesa, MTN MoMo, Airtel Money
  - [ ] Bank transfers
  - [ ] Webhook handlers

- [ ] **Stripe Integration** (international)
  - [ ] Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
  - [ ] Subscription Checkout
  - [ ] Webhook handlers for:
    - `checkout.session.completed`
    - `invoice.paid`
    - `invoice.payment_failed`
    - `customer.subscription.deleted`
  - [ ] Billing portal
  - [ ] Subscription upgrade/downgrade with proration

- [ ] **MTN MoMo API** (Ghana, Nigeria, Uganda)
  - [ ] Collections API
  - [ ] Disbursements API
  - [ ] API key management

- [ ] **Airtel Money API**
  - [ ] Collections
  - [ ] Disbursements

- [ ] **Multi-Currency Wallet**
  - [ ] KES (Kenyan Shilling)
  - [ ] NGN (Nigerian Naira)
  - [ ] GHS (Ghanaian Cedi)
  - [ ] ZAR (South African Rand)
  - [ ] UGX (Ugandan Shilling)
  - [ ] TZS (Tanzanian Shilling)
  - [ ] XOF/XAF (CFA Franc)
  - [ ] ETB (Ethiopian Birr)
  - [ ] Real-time exchange rate engine
  - [ ] Spread management

### KYC/AML Compliance
- [ ] **Smile Identity Integration** (Africa-focused KYC provider)
  - [ ] Document upload (passport, national ID, driver's license)
  - [ ] Selfie/liveness check
  - [ ] Auto-approval for clear cases
  - [ ] Manual review queue
  - [ ] Store verification status in `users` table
  - [ ] Biometric matching

- [ ] **KYC Tiers Implementation**
  - [ ] Tier 1: Email + phone verification (max $100/day)
  - [ ] Tier 2: Government ID verified (max $1,000/day)
  - [ ] Tier 3: Liveness + address proof (unlimited)

- [ ] **AML Transaction Monitoring**
  - [ ] Transaction velocity checks
  - [ ] Sanctions screening (OFAC, UN, EU lists)
  - [ ] PEP (Politically Exposed Persons) screening
  - [ ] Suspicious Activity Reports (SAR) workflow
  - [ ] Risk scoring per transaction
  - [ ] Travel Rule compliance (FATF)

- [ ] **Withdrawal Security**
  - [ ] Withdrawal whitelist (pre-approved addresses)
  - [ ] Withdrawal limits per tier
  - [ ] Multi-sig treasury for cold storage
  - [ ] Transaction signing

### Security
- [ ] **Multi-Factor Authentication (MFA)**
  - [ ] TOTP support (Google Authenticator)
  - [ ] SMS 2FA
  - [ ] Hardware key support (YubiKey)
  - [ ] Backup codes

- [ ] **Authentication Hardening**
  - [ ] Remove dev Clerk keys from production
  - [ ] Enforce email verification before dashboard
  - [ ] CSRF protection on mutations
  - [ ] Rate limiting (5 login attempts/min per IP)
  - [ ] Account lockout after 10 failed attempts
  - [ ] Session timeout after 30min inactivity
  - [ ] Device management (trusted devices list)
  - [ ] New device login alerts

- [ ] **Authorization & Access Control**
  - [ ] Row-level security on all Convex queries
  - [ ] Enforce `checkAccess` on premium features
  - [ ] API key validation for TradingView webhooks
  - [ ] Admin-only guards on `convex/admin.ts`

### Real Market Data Ingestion
- [ ] **WebSocket Adapters (Production-Ready)**
  - [ ] Binance WebSocket (`convex/ingestion/adapters/binance.ts`)
  - [ ] Coinbase WebSocket (`convex/ingestion/adapters/coinbase.ts`)
  - [ ] Kraken WebSocket (`convex/ingestion/adapters/kraken.ts`)
  - [ ] Auto-reconnection logic
  - [ ] Heartbeat monitoring
  - [ ] Message deduplication

- [ ] **REST API Integrations**
  - [ ] CoinGecko API (server-side proxy to fix CORS)
  - [ ] CoinMarketCap API
  - [ ] Alpha Vantage (forex data)
  - [ ] Finnhub (stocks + forex)
  - [ ] Yahoo Finance
  - [ ] Polygon.io
  - [ ] CoinAPI
  - [ ] Twelve Data
  - [ ] Marketaux (news sentiment)

- [ ] **Data Processing Layer**
  - [ ] Redis buffer implementation (`convex/ingestion/redisBuffer.ts`)
  - [ ] WebSocket optimizer (`convex/ingestion/wsOptimizer.ts`)
  - [ ] Data normalization to `canonicalInstruments` format
  - [ ] Price aggregation from multiple sources
  - [ ] Stale data detection (>30s old)
  - [ ] Price deviation alerts (>5% in 1min)
  - [ ] Historical data backfill
  - [ ] OHLCV candle aggregation
  - [ ] Order book snapshot storage (L2/L3)
  - [ ] Trade tick storage

- [ ] **Wire to Frontend**
  - [ ] Replace mock data in `MarketDataContext`
  - [ ] Implement price caching layer
  - [ ] Multi-source failover logic
  - [ ] Connection health monitoring
  - [ ] Stream status tracking in UI

### Real Trading Engine
- [ ] **Exchange API Integration**
  - [ ] Binance API (spot + futures)
  - [ ] Coinbase Advanced Trade API
  - [ ] Kraken API
  - [ ] Secure API key storage per exchange
  - [ ] API key encryption

- [ ] **Order Execution**
  - [ ] Market orders
  - [ ] Limit orders
  - [ ] Stop-loss orders
  - [ ] Take-profit orders
  - [ ] OCO (One-Cancels-Other)
  - [ ] Iceberg orders
  - [ ] Post-Only / Fill-or-Kill / IOC
  - [ ] TWAP scheduler
  - [ ] VWAP execution
  - [ ] Order status tracking
  - [ ] Fill reconciliation

- [ ] **Portfolio Management**
  - [ ] Real-time portfolio valuation
  - [ ] Position tracking with P&L
  - [ ] Realized/unrealized P&L calculation
  - [ ] Trade history
  - [ ] Fee tracking across exchanges
  - [ ] Performance attribution
  - [ ] CSV/PDF export of trade history
  - [ ] Multi-currency conversion (USD ↔ KES ↔ NGN ↔ GHS)

---

## 🟡 HIGH PRIORITY (Complete Within 3 Months)

### Signal Engine (Complete All Stubs)
- [ ] **RSI Signals**
  - [ ] `rsiOversold.ts` - RSI < 30 detection
  - [ ] `rsiOverbought.ts` - RSI > 70 detection
  - [ ] `rsiBullish.ts` - RSI bullish crossover
  - [ ] `rsiNeutral.ts` - RSI neutral zone
  - [ ] `rsiTrend.ts` - RSI trend identification
  - [ ] `rsiMomentum.ts` - RSI momentum analysis
  - [ ] `rsiDivergenceBullish.ts` - Bullish divergence
  - [ ] `rsiDivergenceBearish.ts` - Bearish divergence

- [ ] **Other Technical Signals**
  - [ ] `macdCrossover.ts` - MACD signal/trigger crossover
  - [ ] `volumeBreakout.ts` - Volume spike breakout
  - [ ] `oiDivergence.ts` - Open interest divergence
  - [ ] `crossExchangeSpread.ts` - Cross-exchange arbitrage
  - [ ] `arbSignal.ts` - Arbitrage signal aggregation
  - [ ] `liquidationCascade.ts` - Liquidation cascade detection

- [ ] **New Signals to Implement**
  - [ ] Bollinger Band Squeeze
  - [ ] Support/Resistance Breakout
  - [ ] EMA/MA Crossover (golden cross, death cross)
  - [ ] Parabolic SAR Reversal
  - [ ] Pattern Recognition (head & shoulders, double top/bottom, flags)
  - [ ] Volume Profile
  - [ ] VWAP Cross
  - [ ] Cumulative Delta
  - [ ] Order Flow Imbalance
  - [ ] Funding Rate-Based Signals
  - [ ] Whale Tracking Signals
  - [ ] Smart Money Flow Signals

- [ ] **Signal Quality**
  - [ ] Backtesting with historical data
  - [ ] Signal quality scoring
  - [ ] False positive rate < 40%
  - [ ] Convex queries for fetching signals
  - [ ] Frontend visualization

### AI/NVIDIA Integration
- [ ] **NVIDIA NIM API Integration**
  - [ ] Connect `src/services/nvidiaService.ts` to real API
  - [ ] Implement inference calls in `useNvidiaAI.ts`
  - [ ] AI price predictions with confidence scores
  - [ ] Sentiment analysis on news/social media
  - [ ] AI trading signals
  - [ ] AI chatbot/copilot for trading assistance

- [ ] **AI Features**
  - [ ] Portfolio risk assessment
  - [ ] Natural language queries ("show my best performing assets")
  - [ ] Portfolio optimization (Markowitz, Black-Litterman)
  - [ ] Anomaly detection (unusual price movements)
  - [ ] Model versioning and A/B testing
  - [ ] AI provenance tracking

### Alert System
- [ ] **Alert Evaluation Engine**
  - [ ] Real-time evaluation against live data
  - [ ] Alert deduplication (prevent spam)
  - [ ] Cooldown periods between alerts

- [ ] **Alert Conditions**
  - [ ] Price above/below threshold
  - [ ] Percentage change in time window
  - [ ] Technical indicator trigger
  - [ ] Volume spike
  - [ ] Cross-exchange spread threshold
  - [ ] Signal trigger
  - [ ] Whale trade
  - [ ] News event

- [ ] **Alert Delivery**
  - [ ] Email (SendGrid/Resend)
  - [ ] SMS (Twilio/Africa's Talking)
  - [ ] Push notifications (Firebase FCM)
  - [ ] In-app notification center
  - [ ] Webhook delivery
  - [ ] Retry logic for failed deliveries

### Subscription System
- [ ] **Stripe Webhooks** (`convex/subscriptions.ts`)
  - [ ] `checkout.session.completed` → Activate subscription
  - [ ] `invoice.paid` → Extend period
  - [ ] `invoice.payment_failed` → Suspend account
  - [ ] `customer.subscription.deleted` → Deactivate

- [ ] **Subscription Tiers**
  - [ ] Free: Basic data, 3 alerts, 1 watchlist
  - [ ] Pro ($19/mo): All signals, unlimited alerts, 10 watchlists
  - [ ] Premium ($49/mo): AI predictions, copy trading
  - [ ] Institutional: Custom limits, API access

- [ ] **Features**
  - [ ] 7-day free trial
  - [ ] Upgrade/downgrade with proration
  - [ ] Billing portal
  - [ ] Invoice generation
  - [ ] Referral program with rewards
  - [ ] Feature gating by tier

### Social Trading
- [ ] **Copy Trading**
  - [ ] Real follow/unfollow logic
  - [ ] Trade copy execution (auto-execute leader trades)
  - [ ] Performance tracking per trader
  - [ ] Leaderboard (P&L, win rate, Sharpe ratio)
  - [ ] Trade feed from real positions
  - [ ] Risk-based copy scaling (follower controls position size)
  - [ ] Profit sharing mechanism

- [ ] **Social Features**
  - [ ] User profiles with trading stats
  - [ ] Discussion forums
  - [ ] Comments on signals/instruments
  - [ ] Voting system (upvote/downvote)
  - [ ] Achievement badges
  - [ ] Public/private trading strategies

### P2P Marketplace
- [ ] **Core Features**
  - [ ] Real P2P order book (buy/sell ads)
  - [ ] Escrow system (hold crypto during trade)
  - [ ] Dispute resolution workflow
  - [ ] Reputation/rating system
  - [ ] Payment method matching
  - [ ] Auto-release on payment confirmation
  - [ ] Trade limits by KYC level

- [ ] **Advanced**
  - [ ] Chat between buyer/seller
  - [ ] Merchant program
  - [ ] Referral/affiliate program
  - [ ] Auto-trade bot for recurring orders

---

## 🟢 MEDIUM PRIORITY (Complete Within 6 Months)

### Vault & Savings Products
- [ ] **Crypto Staking**
  - [ ] Kiln/Staked/Allnodes integration
  - [ ] Staking APY calculation
  - [ ] Lock-up period configuration
  - [ ] Reward distribution tracking
  - [ ] Wire `VaultPage.tsx` to real data

- [ ] **Savings Products**
  - [ ] Flexible savings (daily interest)
  - [ ] Fixed savings/time deposits (higher rates, locked period)
  - [ ] Fiat savings accounts (interest-bearing)

- [ ] **DeFi Integration**
  - [ ] DeFi yield aggregator
  - [ ] Liquidity pool monitoring (Uniswap, PancakeSwap)
  - [ ] Cross-chain bridge
  - [ ] Web3 wallet connect (MetaMask, WalletConnect)
  - [ ] Self-custodial wallet

- [ ] **Learn & Earn**
  - [ ] Educational content library
  - [ ] Quiz/assessment system
  - [ ] Crypto rewards for course completion
  - [ ] Progress tracking
  - [ ] Certificate generation
  - [ ] Wire `LearnAndEarn.tsx` to real content

- [ ] **Recurring Buys (DCA)**
  - [ ] Real recurring buy scheduling
  - [ ] Connect to fiat on-ramp
  - [ ] Buy execution at scheduled times
  - [ ] DCA performance tracking vs lump sum
  - [ ] Wire `RecurringBuys.tsx` to real plans

### Advanced Charting
- [ ] **TradingView Integration**
  - [ ] TradingView Lightweight Charts widget
  - [ ] Full TradingView Charting Library
  - [ ] Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d, 1w)
  - [ ] Drawing tools (trendlines, rectangles, fib retracement)
  - [ ] Chart saving/layout presets
  - [ ] Multi-chart layout (split screen)

- [ ] **Technical Indicators**
  - [ ] Bollinger Bands
  - [ ] Moving Averages (SMA, EMA, WEMA)
  - [ ] Fibonacci Retracement/Extension
  - [ ] Ichimoku Cloud
  - [ ] Parabolic SAR
  - [ ] ATR (Average True Range)
  - [ ] OBV (On-Balance Volume)
  - [ ] Stochastic RSI
  - [ ] Williams %R
  - [ ] Money Flow Index (MFI)
  - [ ] Chaikin Money Flow
  - [ ] Elder-Ray Index
  - [ ] Keltner Channels
  - [ ] Donchian Channels
  - [ ] Heikin-Ashi candles
  - [ ] Renko charts

- [ ] **Strategy Backtesting**
  - [ ] Backtesting engine
  - [ ] Historical data import (CSV, exchange API)
  - [ ] Walk-forward optimization
  - [ ] Monte Carlo simulation
  - [ ] Performance metrics (Sharpe, Sortino, Calmar, Max DD, Win Rate)
  - [ ] Strategy comparison (A/B test)

### Events & News
- [ ] **Events Calendar**
  - [ ] Server-side proxy for CoinGecko (fix CORS)
  - [ ] Real event data sources
  - [ ] Event filtering by category
  - [ ] Impact scoring (high/medium/low)
  - [ ] Wire `Events.tsx` and `EventsCalendarView.tsx`

- [ ] **News Feed**
  - [ ] CoinDesk API integration
  - [ ] CoinTelegraph API
  - [ ] NLP sentiment analysis
  - [ ] News → price impact correlation
  - [ ] Categorized news feed

### Admin Dashboard
- [ ] **User Management**
  - [ ] View all users
  - [ ] Suspend/activate users
  - [ ] Delete users
  - [ ] Verify KYC documents
  - [ ] View user activity logs

- [ ] **System Management**
  - [ ] KYC verification queue (approve/reject)
  - [ ] Order management (view, cancel, force-close)
  - [ ] Transaction monitoring (all deposits/withdrawals)
  - [ ] Fee management (set trading fees per tier)
  - [ ] Trading pair management (enable/disable)
  - [ ] P2P dispute management
  - [ ] System health dashboard
  - [ ] Audit log viewer
  - [ ] Role-based access control

- [ ] **Monitoring**
  - [ ] Service uptime monitoring
  - [ ] Anomaly detection (price manipulation, wash trading)
  - [ ] Server performance metrics
  - [ ] Error tracking & alerting
  - [ ] Rate limit monitoring

---

## 🔵 LOW PRIORITY (Nice to Have)

### Africa-Native Features
- [ ] **Tokenization**
  - [ ] Tokenized government bonds (M-Akiba Kenya, FGN Bond Nigeria)
  - [ ] Tokenized commodities (gold, oil, cocoa, coffee)
  - [ ] Agricultural commodity tokens
  - [ ] Carbon credit trading

- [ ] **African Blockchain Integration**
  - [ ] NEM integration
  - [ ] Cardano (African focus)
  - [ ] Celo (mobile-first blockchain)
  - [ ] eNaira (Nigeria CBDC)

- [ ] **Remittance Features**
  - [ ] African Crypto Index (basket of Africa-relevant tokens)
  - [ ] Remittance cost comparator
  - [ ] Cross-border payment hub
  - [ ] Local exchange rate aggregator

- [ ] **Bill Payments & Airtime**
  - [ ] Buy airtime (Safaricom, MTN, Vodacom, Glo)
  - [ ] Data bundles purchase
  - [ ] Utility bill payments (electricity, water, TV)
  - [ ] School fees payment
  - [ ] Insurance premium payments

### Mobile App
- [ ] **React Native / Expo**
  - [ ] Project setup
  - [ ] Push notifications (price alerts, trade fills)
  - [ ] Biometric auth (fingerprint, face ID)
  - [ ] Mobile-first UX
  - [ ] Offline mode (cached prices, queued actions)
  - [ ] iOS/Android app store deployment

### UI/UX Improvements
- [ ] **Localization**
  - [ ] Swahili (East Africa)
  - [ ] French (West Africa)
  - [ ] Portuguese (Mozambique, Angola)
  - [ ] Arabic (North Africa)
  - [ ] Hausa (Nigeria, Niger)
  - [ ] Zulu/Xhosa (South Africa)
  - [ ] Amharic (Ethiopia)
  - [ ] Yoruba (Nigeria)
  - [ ] RTL support for Arabic
  - [ ] Local currency formatting

- [ ] **User Experience**
  - [ ] Full responsive design (tablet, mobile, desktop)
  - [ ] Accessibility (WCAG 2.1 AA)
  - [ ] Notification center (bell icon dropdown)
  - [ ] Keyboard shortcuts for power users
  - [ ] Customizable dashboard (drag-and-drop widgets)
  - [ ] Tour/onboarding modal
  - [ ] Empty states (no transactions, no watchlist)
  - [ ] Loading skeletons
  - [ ] Confetti/celebrations for milestones

### API & Integrations
- [ ] **Public API**
  - [ ] REST API for algorithmic traders
  - [ ] WebSocket API for real-time data
  - [ ] API key management (create, revoke, permissions)
  - [ ] API documentation
  - [ ] Rate limiting per API key

- [ ] **Bank Integrations**
  - [ ] Open Banking API (Equity, KCB, Access, Stanbic)
  - [ ] Bank account verification
  - [ ] Direct bank deposits/withdrawals

- [ ] **Third-Party Integrations**
  - [ ] TradingView webhook-to-order
  - [ ] Blockchain explorers (Etherscan, Solscan)
  - [ ] Exchange rate API (XE, OpenExchangeRates)
  - [ ] Tax reporting export (CSV)

### Infrastructure
- [ ] **Performance**
  - [ ] React.lazy + Suspense for all routes (DONE)
  - [ ] Virtual scrolling for large lists
  - [ ] Service worker for offline caching
  - [ ] Bundle size optimization
  - [ ] Image optimization (WebP, lazy loading)
  - [ ] Prefetching for likely next pages
  - [ ] Convex query caching
  - [ ] Database connection pooling
  - [ ] Query pagination
  - [ ] WebSocket horizontal scaling (Redis pub/sub)

- [ ] **DevOps**
  - [ ] Error tracking (Sentry)
  - [ ] Application monitoring (Datadog/Grafana)
  - [ ] Structured logging
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Automated testing:
    - [ ] Unit tests for Convex functions
    - [ ] Integration tests for webhooks
    - [ ] E2E tests for critical flows
  - [ ] Environment-based config (dev/staging/production)
  - [ ] Database backup strategy
  - [ ] Load testing (k6, Artillery)

---

## 📊 IMPLEMENTATION TRACKING

### Overall Progress
- **Total Features:** ~400
- **Completed:** ~10 (2.5%)
- **In Progress:** 0
- **Remaining:** ~390 (97.5%)

### By Priority
- 🔴 Critical: ~80 features, 0% complete
- 🟡 High: ~150 features, 0% complete
- 🟢 Medium: ~120 features, 0% complete
- 🔵 Low: ~50 features, 0% complete

---

## 🎯 NEXT ACTIONS

1. **Week 1-2:** Complete all security fixes and infrastructure
2. **Week 3-4:** Implement real market data pipelines
3. **Week 5-6:** Integrate M-Pesa + Paystack + Stripe
4. **Week 7-8:** Build real trading engine with order execution
5. **Week 9-10:** Deploy KYC/AML with Smile Identity
6. **Week 11-12:** Complete signal engine and AI integration
7. **Week 13-14:** Launch social trading and P2P marketplace
8. **Week 15-16:** Mobile app and African localization

---

*This checklist represents the complete feature set required to compete with Binance, Coinbase, VALR, and Yellow Card in the African market.*