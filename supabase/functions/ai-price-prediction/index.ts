import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      symbol, 
      name,
      currentPrice, 
      priceData, 
      volume, 
      priceChange24h,
      marketCap,
      timeframe = '24h'
    } = await req.json();

    console.log(`AI Prediction request for ${symbol} (${timeframe})`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate technical indicators from price data
    const indicators = calculateIndicators(priceData);
    
    // Build comprehensive analysis prompt
    const systemPrompt = `You are an expert cryptocurrency market analyst with deep knowledge of technical analysis, market sentiment, and price prediction. Provide realistic, data-driven predictions with clear reasoning.`;

    const userPrompt = `Analyze ${name} (${symbol}) for ${timeframe} price prediction.

CURRENT DATA:
- Current Price: $${currentPrice.toLocaleString()}
- 24h Change: ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
- 24h Volume: $${(volume / 1e9).toFixed(2)}B
- Market Cap: $${(marketCap / 1e9).toFixed(2)}B

TECHNICAL INDICATORS:
- RSI: ${indicators.rsi.toFixed(2)} (${getRSISignal(indicators.rsi)})
- 7-day Moving Average: $${indicators.sma7.toFixed(2)}
- 30-day Moving Average: $${indicators.sma30.toFixed(2)}
- Volatility: ${indicators.volatility.toFixed(2)}%
- Momentum: ${indicators.momentum >= 0 ? '+' : ''}${indicators.momentum.toFixed(2)}%

RECENT PRICE ACTION:
${priceData.slice(-7).map((p: number, i: number) => `Day ${i + 1}: $${p.toFixed(2)}`).join('\n')}

Provide a ${timeframe} price prediction with:
1. Predicted price (single number)
2. Confidence level (0-100)
3. Price range (low to high)
4. Top 3-5 contributing factors
5. Risk level (low/medium/high)

Respond in this EXACT JSON format:
{
  "predicted_price": number,
  "confidence_level": number,
  "price_range": {
    "low": number,
    "high": number
  },
  "contributing_factors": [string array],
  "risk_level": "low" | "medium" | "high",
  "analysis_summary": "Brief 2-3 sentence summary"
}`;

    console.log('Calling Lovable AI for prediction...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    const aiContent = aiResponse.choices[0].message.content;
    
    // Parse JSON from AI response
    let prediction;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to basic prediction
      prediction = generateFallbackPrediction(currentPrice, indicators, timeframe);
    }

    // Add metadata
    const result = {
      ...prediction,
      symbol,
      name,
      timeframe,
      current_price: currentPrice,
      timestamp: new Date().toISOString(),
      technical_indicators: indicators,
    };

    console.log('Prediction generated successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-price-prediction:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate prediction'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to calculate technical indicators
function calculateIndicators(priceData: number[]) {
  const prices = priceData.slice(-30); // Last 30 data points
  
  // RSI Calculation (14-period)
  const rsi = calculateRSI(prices, 14);
  
  // Simple Moving Averages
  const sma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const sma30 = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  // Volatility (standard deviation)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const volatility = (Math.sqrt(variance) / mean) * 100;
  
  // Momentum (rate of change)
  const momentum = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  
  return { rsi, sma7, sma30, volatility, momentum };
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

function getRSISignal(rsi: number): string {
  if (rsi > 70) return 'Overbought';
  if (rsi < 30) return 'Oversold';
  return 'Neutral';
}

function generateFallbackPrediction(currentPrice: number, indicators: any, timeframe: string) {
  const multipliers: Record<string, number> = {
    '24h': 0.03,
    '7d': 0.08,
    '30d': 0.15
  };
  
  const multiplier = multipliers[timeframe] || 0.05;
  const trend = indicators.momentum > 0 ? 1 : -1;
  const volatilityFactor = Math.min(indicators.volatility / 100, 0.5);
  
  const predictedChange = currentPrice * multiplier * trend * (1 + volatilityFactor);
  const predictedPrice = currentPrice + predictedChange;
  
  return {
    predicted_price: predictedPrice,
    confidence_level: 65,
    price_range: {
      low: predictedPrice * 0.95,
      high: predictedPrice * 1.05
    },
    contributing_factors: [
      `Current momentum: ${indicators.momentum >= 0 ? 'Positive' : 'Negative'}`,
      `RSI indicates ${getRSISignal(indicators.rsi)} conditions`,
      `Volatility: ${indicators.volatility.toFixed(1)}%`
    ],
    risk_level: indicators.volatility > 5 ? 'high' : indicators.volatility > 3 ? 'medium' : 'low',
    analysis_summary: 'Prediction based on technical indicators and recent price action.'
  };
}
