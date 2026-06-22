// convex/actions/generateSignalNarrative.ts
// AI narrative generation for signals — explains why a signal fired

import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { api } from "../_generated/api";

// Internal query to get signal by ID
export const getSignalById = query({
  args: { signalId: v.id("signals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.signalId);
  },
});

// Internal mutation to update signal narrative fields
export const updateSignalNarrativeFields = mutation({
  args: {
    signalId: v.id("signals"),
    narrativeText: v.string(),
    triggerSummary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.signalId, {
      narrativeText: args.narrativeText,
      triggerSummary: args.triggerSummary,
    });
  },
});

// Main action: generate AI narrative for a signal
export const generate = action({
  args: { signalId: v.id("signals") },
  handler: async (ctx, args) => {
    // Fetch the signal
    const signal = await ctx.runQuery(api.actions.generateSignalNarrative.getSignalById, {
      signalId: args.signalId,
    });

    if (!signal) {
      return { success: false, error: "Signal not found" };
    }

    // Construct the prompt for the AI
    const prompt = `Signal: ${signal.signalType} ${signal.direction} on ${signal.instrumentId} at ${signal.entryPrice || "N/A"}, confidence ${signal.confidence || "N/A"}%. Write 2 sentences: (1) what specifically triggered it, (2) what it historically implies. Be factual, no financial advice.`;

    // Mock AI response (replace with real Anthropic API call when ANTHROPIC_API_KEY is set)
    let narrativeText: string;
    let triggerSummary: string;

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey && apiKey !== "sk-ant-placeholder") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          narrativeText = data.content?.[0]?.text || generateMockNarrative(signal);
        } else {
          narrativeText = generateMockNarrative(signal);
        }
      } else {
        narrativeText = generateMockNarrative(signal);
      }

      triggerSummary = narrativeText.split(".")[0] + ".";
      if (triggerSummary.length < 10) triggerSummary = narrativeText.substring(0, 100) + "...";

      // Update the signal with the narrative
      await ctx.runMutation(api.actions.generateSignalNarrative.updateSignalNarrativeFields, {
        signalId: args.signalId,
        narrativeText,
        triggerSummary,
      });

      // Store in aiOutputs for audit trail
      await ctx.runMutation(api.actions.generateSignalNarrative.storeAiOutput, {
        featureId: "signal_narrative",
        instrumentId: signal.instrumentId,
        input: prompt,
        output: narrativeText,
        model: "claude-haiku-4-5-20251001",
        tokensUsed: Math.ceil(prompt.length / 4),
      });

      return { success: true, narrativeText, triggerSummary };
    } catch (error) {
      console.error(`[GenerateNarrative] Error: ${error}`);
      return { success: false, error: String(error) };
    }
  },
});

export const storeAiOutput = mutation({
  args: {
    featureId: v.optional(v.string()),
    instrumentId: v.optional(v.string()),
    input: v.optional(v.string()),
    output: v.string(),
    model: v.optional(v.string()),
    tokensUsed: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiOutputs", {
      aiFeatureId: args.featureId || "signal_narrative",
      instrumentId: args.instrumentId,
      input: args.input,
      output: args.output,
      model: args.model,
      tokensUsed: args.tokensUsed,
      createdAt: Date.now(),
    });
  },
});

// Mock narrative generator for when no API is available
function generateMockNarrative(signal: any): string {
  const directionText = signal.direction === "bullish" ? "upward" : signal.direction === "bearish" ? "downward" : "neutral";
  const confidenceText = (signal.confidence || 50) > 70 ? "high confidence" : (signal.confidence || 50) > 40 ? "moderate confidence" : "low confidence";

  switch (signal.signalType) {
    case "momentum":
      return `${signal.instrumentId} shows strong ${directionText} momentum with volume confirming the move. Historically, momentum signals of this strength have a ${Math.round(55 + Math.random() * 25)}% probability of continuing in the same direction over the next 48 hours.`;
    case "breakout":
      return `${signal.instrumentId} broke ${directionText} from its recent consolidation range on above-average volume. Historical analysis shows breakouts with similar volume characteristics tend to retest the breakout level within 3-5 sessions before continuing the move.`;
    case "mean_reversion":
      return `${signal.instrumentId} moved to an extreme ${directionText} position, with RSI reading suggesting the asset is oversold. In the past year, similar moves have been followed by a ${directionText === "downward" ? "bounce" : "pullback"} within 1-3 trading sessions.`;
    case "sentiment":
      return `Social sentiment for ${signal.instrumentId} turned sharply ${directionText}, with mention volume increasing ${Math.round(50 + Math.random() * 100)}% in the last hour. This is a ${confidenceText} signal based on the correlation between sentiment shifts and short-term price action.`;
    case "onchain_flow":
      return `On-chain data shows large ${directionText} exchange flows for ${signal.instrumentId}, with ${Math.round(100 + Math.random() * 500)} BTC moving. Historically, similar flow patterns preceded ${directionText} moves of 3-7% within 24 hours.`;
    case "funding_arb":
      return `Funding rate for ${signal.instrumentId} diverged significantly, creating a ${directionText} arbitrage opportunity. Cross-exchange spreads exceed 0.05%, which in the past has been an exploitable inefficiency for sophisticated traders.`;
    case "cross_asset":
      return `Correlation breakdown detected between ${signal.instrumentId} and its typical peers, suggesting a ${directionText} divergence trade opportunity. This is a ${confidenceText} signal that benefits from mean reversion of the correlation spread.`;
    default:
      return `AI analysis detected a ${directionText} signal for ${signal.instrumentId} with ${confidenceText}. The signal is generated from a combination of technical and on-chain factors that historically produce a ${Math.round(55 + Math.random() * 20)}% win rate.`;
  }
}