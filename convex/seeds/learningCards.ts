// convex/seeds/learningCards.ts
// Seed data for contextual micro-learning cards

import { mutation } from "../_generated/server";

export const seedLearningCards = mutation({
  handler: async (ctx) => {
    const cards = [
      // ─── Basics ─────────────────────────────────────────────────────
      {
        cardId: "what_is_funding_rate",
        title: "What is a Funding Rate?",
        content: "A funding rate is a periodic payment between long and short traders in perpetual futures contracts. When positive, longs pay shorts (bullish sentiment = expensive to hold long). When negative, shorts pay longs (bearish sentiment). High funding rates often signal crowded trades that may reverse.",
        category: "basics" as const,
        triggerContext: JSON.stringify({ signalType: ["funding_arb"], alertType: ["funding_change"] }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 45,
        isActive: true,
      },
      {
        cardId: "what_are_liquidations",
        title: "Why Do Liquidations Matter?",
        content: "A liquidation occurs when a trader's position is forcibly closed due to insufficient margin. Large liquidations create cascading effects — a long liquidation sells the asset, pushing price down, causing more longs to liquidate. Liquidation heatmaps help visualize clusters where price could move rapidly.",
        category: "basics" as const,
        triggerContext: JSON.stringify({ eventCategory: ["liquidation_cluster"], signalType: ["momentum"] }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 50,
        isActive: true,
      },
      {
        cardId: "what_is_rsi",
        title: "Understanding RSI (Relative Strength Index)",
        content: "RSI measures the speed and magnitude of recent price changes on a scale of 0-100. Readings above 70 suggest overbought conditions (potential sell), below 30 suggest oversold (potential buy). Divergence occurs when price makes a new high/low but RSI doesn't — a powerful reversal signal.",
        category: "basics" as const,
        triggerContext: JSON.stringify({ signalType: ["mean_reversion"] }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 55,
        isActive: true,
      },
      {
        cardId: "what_is_open_interest",
        title: "Open Interest Explained",
        content: "Open Interest (OI) represents the total number of outstanding derivative contracts that haven't been settled. Rising OI + rising price = new money entering (trend likely continues). Falling OI + rising price = trend weakening as positions close. OI spikes often precede increased volatility.",
        category: "basics" as const,
        triggerContext: JSON.stringify({ alertType: ["oi_change"] }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 50,
        isActive: true,
      },
      // ─── Derivatives ─────────────────────────────────────────────────
      {
        cardId: "perp_vs_futures",
        title: "Perpetuals vs Traditional Futures",
        content: "Perpetual swaps have no expiration date. They use a funding rate mechanism to keep the contract price close to the spot price. Traditional futures expire on a set date, which can create 'contango' (future > spot) or 'backwardation' (future < spot) based on market expectations.",
        category: "derivatives" as const,
        triggerContext: JSON.stringify({ signalType: ["funding_arb"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 60,
        isActive: true,
      },
      {
        cardId: "basis_trading",
        title: "Basis Trading Strategy",
        content: "Basis refers to the price difference between spot and futures markets. A positive basis (contango) means futures trade at a premium — you can buy spot and sell futures to capture the spread. This is called 'cash-and-carry' and is a popular market-neutral strategy.",
        category: "derivatives" as const,
        triggerContext: JSON.stringify({ signalType: ["cross_asset"] }),
        difficulty: "advanced" as const,
        estimatedReadSeconds: 70,
        isActive: true,
      },
      // ─── On-Chain ────────────────────────────────────────────────────
      {
        cardId: "mvrv_explained",
        title: "MVRV Ratio: What It Tells Us",
        content: "MVRV (Market Value to Realized Value) compares current market cap to the aggregate cost basis of all coins. MVRV > 3.5 = market overheated (typical top zone). MVRV < 1 = market deeply undervalued (typical bottom zone). Values between 1.5-2.5 suggest neutral territory.",
        category: "onchain" as const,
        triggerContext: JSON.stringify({ eventCategory: ["onchain"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 50,
        isActive: true,
      },
      {
        cardId: "exchange_flows",
        title: "Exchange Netflow: Following Smart Money",
        content: "Exchange netflow tracks the net amount of crypto moving into/out of exchanges. Large outflows (negative netflow) suggest holders move coins to cold storage = accumulation. Large inflows (positive netflow) suggest intent to sell = distribution. Spikes in either direction are key signals.",
        category: "onchain" as const,
        triggerContext: JSON.stringify({ signalType: ["onchain_flow"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 55,
        isActive: true,
      },
      // ─── Macro ────────────────────────────────────────────────────────
      {
        cardId: "fed_impact_crypto",
        title: "How Fed Decisions Affect Crypto",
        content: "Federal Reserve interest rate decisions impact crypto through liquidity channels. Rate hikes = stronger USD, risk-off sentiment, capital flowing to safer assets. Rate cuts = weaker USD, crypto tends to rally. Key events: FOMC meetings (8x/year), CPI releases, and dot-plot projections.",
        category: "macro" as const,
        triggerContext: JSON.stringify({ eventCategory: ["macro"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 60,
        isActive: true,
      },
      {
        cardId: "cpi_and_crypto",
        title: "CPI Reports: Why They Move Markets",
        content: "Consumer Price Index (CPI) measures inflation. Higher-than-expected CPI = fear of aggressive rate hikes = crypto typically sells off. Lower CPI = potential rate cuts = crypto rallies. Crypto markets react strongly to CPI because it signals future monetary policy direction.",
        category: "macro" as const,
        triggerContext: JSON.stringify({ eventCategory: ["macro"], expectedVolatility: ["high"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 55,
        isActive: true,
      },
      // ─── Risk ─────────────────────────────────────────────────────────
      {
        cardId: "position_sizing",
        title: "Position Sizing: The 1% Rule",
        content: "Never risk more than 1% of your trading capital on a single trade. If your stop loss is 5% away, your position size should be 20% of your capital (1% / 5% = 20%). This ensures a string of losses won't wipe you out. Position sizing is the single most important risk management skill.",
        category: "risk" as const,
        triggerContext: JSON.stringify({ difficulty: "beginner" }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 45,
        isActive: true,
      },
      {
        cardId: "stop_loss_placement",
        title: "Smart Stop Loss Placement",
        content: "Place stop losses at technical levels, not round numbers. Look for support below your entry for longs, resistance above for shorts. A common approach: place stops 5-10% below the recent swing low. Trailing stops lock in profits as the trade moves in your favor.",
        category: "risk" as const,
        triggerContext: JSON.stringify({ signalType: ["breakout"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 50,
        isActive: true,
      },
      // ─── Strategy ─────────────────────────────────────────────────────
      {
        cardId: "scalping_vs_swing",
        title: "Scalping vs Swing Trading",
        content: "Scalping involves many quick trades (seconds to minutes), targeting small profits with high win rates. Swing trading holds positions for days to weeks, targeting larger moves with lower win rates but better risk-reward. Choose based on your personality: scalping requires constant attention and fast execution.",
        category: "strategy" as const,
        triggerContext: JSON.stringify({ signalType: ["momentum"] }),
        difficulty: "beginner" as const,
        estimatedReadSeconds: 55,
        isActive: true,
      },
      {
        cardId: "divergence_trading",
        title: "Trading RSI Divergence",
        content: "Bullish divergence: price makes lower low, RSI makes higher low = momentum weakening downward, reversal likely. Bearish divergence: price makes higher high, RSI makes lower high = momentum weakening upward, reversal likely. Divergence is one of the most reliable technical signals.",
        category: "strategy" as const,
        triggerContext: JSON.stringify({ signalType: ["mean_reversion"] }),
        difficulty: "advanced" as const,
        estimatedReadSeconds: 60,
        isActive: true,
      },
      {
        cardId: "whale_watching",
        title: "Whale Watching: Reading Big Moves",
        content: "Whale trades > $100K can signal smart money activity. Large buy orders at support levels suggest accumulation. Large sell orders near resistance suggest distribution. Spikes in whale activity often precede major price moves. Use volume profile to confirm whale interest areas.",
        category: "strategy" as const,
        triggerContext: JSON.stringify({ alertType: ["whale_trade"] }),
        difficulty: "intermediate" as const,
        estimatedReadSeconds: 55,
        isActive: true,
      },
    ];

    let created = 0;
    for (const card of cards) {
      // Check if card already exists
      const existing = await ctx.db
        .query("learningCards")
        .withIndex("by_category", (q: any) => q.eq("category", card.category))
        .first();

      if (!existing) {
        await ctx.db.insert("learningCards", card);
        created++;
      }
    }

    return { success: true, cardsCreated: created, total: cards.length };
  },
});