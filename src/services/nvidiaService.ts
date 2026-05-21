import OpenAI from 'openai';

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

let nvidiaClient: OpenAI | null = null;

function getNvidiaClient(): OpenAI {
  if (!nvidiaClient) {
    if (!NVIDIA_API_KEY) {
      throw new Error('VITE_NVIDIA_API_KEY is not configured in .env');
    }
    nvidiaClient = new OpenAI({
      apiKey: NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
      dangerouslyAllowBrowser: true,
    });
  }
  return nvidiaClient;
}

export interface CryptoAnalysisRequest {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  volume: number;
  marketCap: number;
  sparkline?: number[];
}

export interface CryptoAnalysisResponse {
  predicted_price: number;
  confidence_level: number;
  price_range: { low: number; high: number };
  contributing_factors: string[];
  risk_level: 'low' | 'medium' | 'high';
  analysis_summary: string;
  technical_outlook: 'bullish' | 'bearish' | 'neutral';
  support_levels: number[];
  resistance_levels: number[];
  recommended_action: string;
}

export interface CurrencyAnalysisRequest {
  baseCurrency: string;
  targetCurrency: string;
  currentRate: number;
  change24h: number;
}

export interface CurrencyAnalysisResponse {
  forecast: 'strengthen' | 'weaken' | 'stable';
  confidence: number;
  predicted_rate: number;
  analysis: string;
  key_factors: string[];
  timeframe: string;
}

export interface MarketSentimentResponse {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  crypto_sentiment: string;
  forex_sentiment: string;
  fear_greed_index: number;
  key_levels_to_watch: string[];
  news_impact: string;
  summary: string;
}

/**
 * Analyze a cryptocurrency using Nvidia AI
 */
export async function analyzeCryptoWithNvidia(
  request: CryptoAnalysisRequest
): Promise<CryptoAnalysisResponse> {
  const client = getNvidiaClient();

  const systemPrompt = `You are an expert cryptocurrency market analyst powered by NVIDIA AI. 
Analyze the provided crypto data and return a structured JSON prediction with technical analysis.
Be realistic and data-driven in your predictions.`;

  const userPrompt = `Analyze ${request.name} (${request.symbol}) for price prediction:

CURRENT DATA:
- Current Price: $${request.currentPrice.toLocaleString()}
- 24h Change: ${request.priceChange24h >= 0 ? '+' : ''}${request.priceChange24h.toFixed(2)}%
- 24h Volume: $${(request.volume / 1e9).toFixed(2)}B
- Market Cap: $${(request.marketCap / 1e9).toFixed(2)}B
${request.sparkline ? `- Recent price data points: [${request.sparkline.slice(-10).map(p => p.toFixed(2)).join(', ')}]` : ''}

Respond in this EXACT JSON format:
{
  "predicted_price": number,
  "confidence_level": number (0-100),
  "price_range": { "low": number, "high": number },
  "contributing_factors": [string array of 3-5 factors],
  "risk_level": "low" | "medium" | "high",
  "analysis_summary": "2-3 sentence summary",
  "technical_outlook": "bullish" | "bearish" | "neutral",
  "support_levels": [array of 2-3 support prices],
  "resistance_levels": [array of 2-3 resistance prices],
  "recommended_action": "Brief actionable advice"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Nvidia AI response');
    }
    return JSON.parse(jsonMatch[0]) as CryptoAnalysisResponse;
  } catch (error) {
    console.error('Nvidia AI crypto analysis error:', error);
    throw error;
  }
}

/**
 * Analyze a currency pair using Nvidia AI
 */
export async function analyzeCurrencyWithNvidia(
  request: CurrencyAnalysisRequest
): Promise<CurrencyAnalysisResponse> {
  const client = getNvidiaClient();

  const systemPrompt = `You are an expert forex market analyst powered by NVIDIA AI.
Analyze currency pairs and provide structured forecasts with confidence levels.`;

  const userPrompt = `Analyze ${request.baseCurrency}/${request.targetCurrency} forex pair:

CURRENT DATA:
- Current Rate: ${request.currentRate.toFixed(4)}
- 24h Change: ${request.change24h >= 0 ? '+' : ''}${request.change24h.toFixed(2)}%

Provide a short-term forecast (24-48h) in this JSON format:
{
  "forecast": "strengthen" | "weaken" | "stable",
  "confidence": number (0-100),
  "predicted_rate": number,
  "analysis": "Brief analysis of the forecast",
  "key_factors": [array of 3-5 factors],
  "timeframe": "24-48h"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Nvidia AI response');
    }
    return JSON.parse(jsonMatch[0]) as CurrencyAnalysisResponse;
  } catch (error) {
    console.error('Nvidia AI currency analysis error:', error);
    throw error;
  }
}

/**
 * Get overall market sentiment from Nvidia AI
 */
export async function getMarketSentimentFromNvidia(
  cryptoPrices: Record<string, number>,
  currencyRates: Record<string, number>
): Promise<MarketSentimentResponse> {
  const client = getNvidiaClient();

  const topCryptos = Object.entries(cryptoPrices)
    .slice(0, 5)
    .map(([k, v]) => `${k}: $${v}`)
    .join(', ');

  const topCurrencies = Object.entries(currencyRates)
    .slice(0, 8)
    .map(([k, v]) => `${k}: ${v.toFixed(4)}`)
    .join(', ');

  const systemPrompt = `You are a senior market analyst powered by NVIDIA AI.
Analyze real-time market data and provide actionable sentiment analysis.`;

  const userPrompt = `Analyze current market conditions:

CRYPTO PRICES: ${topCryptos}
FOREX RATES (vs USD): ${topCurrencies}

Provide market sentiment analysis in this JSON format:
{
  "overall_sentiment": "bullish" | "bearish" | "neutral" | "mixed",
  "crypto_sentiment": "1-2 sentence crypto market sentiment",
  "forex_sentiment": "1-2 sentence forex market sentiment",
  "fear_greed_index": number (0-100, where 0=extreme fear, 100=extreme greed),
  "key_levels_to_watch": [array of 3-5 key market levels or prices],
  "news_impact": "Brief assessment of recent news impact on markets",
  "summary": "2-3 sentence overall market summary"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Nvidia AI response');
    }
    return JSON.parse(jsonMatch[0]) as MarketSentimentResponse;
  } catch (error) {
    console.error('Nvidia AI sentiment analysis error:', error);
    throw error;
  }
}