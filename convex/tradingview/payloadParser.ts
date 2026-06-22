/**
 * TradingView Alert Payload Parser
 * 
 * Parses the standard TradingView webhook alert JSON format.
 * TradingView sends alerts with variables defined in the alert message.
 * 
 * Standard TradingView alert format (JSON):
 * {
 *   "ticker": "BTCUSDT",
 *   "exchange": "BINANCE",
 *   "action": "buy",          // or "sell"
 *   "price": 50000.00,
 *   "interval": "1h",
 *   "volume": 1234.56,
 *   "strategy": {
 *     "position_size": 0.5,
 *     "order_price": 50000.00,
 *     "market_position": "long", // or "short" or "flat"
 *     "order_action": "buy",    // or "sell"
 *     "order_contracts": 0.5,
 *     "order_id": "12345-67890"
 *   }
 * }
 * 
 * Also supports custom JSON formats with configurable field mappings.
 */

export interface ParsedAlert {
  success: boolean;
  symbol?: string;
  side?: string;
  quantity?: number;
  price?: number;
  orderType?: string;
  strategy?: string;
  exchange?: string;
  interval?: string;
  volume?: number;
  error?: string;
  rawFields?: Record<string, any>;
}

/**
 * Parse a TradingView webhook alert payload.
 * Handles both standard TradingView format and custom JSON formats.
 */
export function parseTradingViewAlert(rawPayload: string): ParsedAlert {
  try {
    const payload = JSON.parse(rawPayload);
    const rawFields: Record<string, any> = payload;

    // Standard TradingView format detection
    const symbol = 
      payload.ticker || 
      payload.symbol || 
      payload.instrument || 
      payload.market ||
      extractField(payload, 'symbol');

    const side = 
      payload.action ||
      payload.side ||
      payload.order_action ||
      payload.direction ||
      payload.signal ||
      extractField(payload, 'side');

    let quantity: number | undefined;
    // Try various common fields for quantity
    if (typeof payload.quantity === 'number') quantity = payload.quantity;
    else if (typeof payload.order_contracts === 'number') quantity = payload.order_contracts;
    else if (typeof payload.position_size === 'number') quantity = Math.abs(payload.position_size);
    else if (payload.strategy?.order_contracts) quantity = payload.strategy.order_contracts;
    else if (payload.strategy?.position_size) quantity = Math.abs(payload.strategy.position_size);
    else if (payload.volume) quantity = Math.abs(payload.volume);
    else if (payload.size) quantity = payload.size;
    else if (payload.amount) quantity = payload.amount;
    else {
      quantity = extractField(payload, 'quantity') || 
                 extractField(payload, 'contracts') || 
                 extractField(payload, 'size') || 
                 extractField(payload, 'amount');
    }

    const price = 
      typeof payload.price === 'number' ? payload.price :
      typeof payload.order_price === 'number' ? payload.order_price :
      payload.strategy?.order_price ||
      extractField(payload, 'price') || 
      extractField(payload, 'limit') ||
      undefined;

    // Determine order type
    let orderType = 'market';
    if (payload.order_type) orderType = payload.order_type;
    else if (payload.type) orderType = payload.type;
    else if (payload.limit_price || (payload.price && payload.price !== 0 && payload.price !== 'market')) {
      // If a specific price is provided, it might be a limit order
      // Default to market unless explicitly stated
      if (payload.order_type === 'limit' || payload.type === 'limit') {
        orderType = 'limit';
      }
    }
    if (payload.stop_price || payload.stop) orderType = 'stop';
    
    const strategy = 
      payload.strategy_name || 
      payload.strategy?.name || 
      payload.alert_name ||
      payload.alert ||
      undefined;

    const exchange = payload.exchange || undefined;
    const interval = payload.interval || payload.timeframe || undefined;
    const volume = typeof payload.volume === 'number' ? payload.volume : undefined;

    // Validate required fields
    if (!symbol) {
      return {
        success: false,
        error: 'Missing required field: symbol/ticker',
        rawFields,
      };
    }

    // Convert side to standard format
    let normalizedSide = normalizeSide(side);
    if (!normalizedSide) {
      // If side is missing, try to infer from strategy position
      if (payload.strategy?.market_position === 'long') normalizedSide = 'buy';
      else if (payload.strategy?.market_position === 'short') normalizedSide = 'sell';
      else if (payload.strategy?.market_position === 'flat') {
        // Closing position - infer from position_size direction
        if (payload.position_size && payload.position_size > 0) normalizedSide = 'sell';
        else if (payload.position_size && payload.position_size < 0) normalizedSide = 'buy';
      }
    }

    if (!normalizedSide) {
      return {
        success: false,
        error: 'Missing required field: action/side/signal',
        rawFields,
      };
    }

    // Validate quantity
    if (quantity === undefined || quantity === null) {
      // If missing, set to 0 - risk controls will catch this if needed
      quantity = 0;
    }
    if (quantity < 0) {
      quantity = Math.abs(quantity);
      // Flip the side for negative quantities (TradingView convention)
      normalizedSide = normalizedSide === 'buy' ? 'sell' : 'buy';
    }

    return {
      success: true,
      symbol: String(symbol).toUpperCase(),
      side: normalizedSide,
      quantity: Math.abs(quantity),
      price: price ? Number(price) : undefined,
      orderType: orderType.toLowerCase(),
      strategy: strategy ? String(strategy) : undefined,
      exchange: exchange ? String(exchange) : undefined,
      interval: interval ? String(interval) : undefined,
      volume: volume ? Number(volume) : undefined,
      rawFields,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Invalid JSON payload: ${error.message}`,
    } as ParsedAlert;
  }
}

/**
 * Extract a field from potentially nested payload using dot notation
 */
function extractField(payload: Record<string, any> | undefined, field: string): unknown {
  if (!payload) return undefined;
  // Check for nested fields
  const patterns = [
    [`strategy.${field}`],
    [`alert.${field}`],
    [`order.${field}`],
    [`data.${field}`],
  ];

  for (const [path] of patterns) {
    const parts = path.split('.');
    let current = payload;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }
    if (current !== undefined) return current;
  }

  return undefined;
}

/**
 * Normalize various side/action representations to standard buy/sell/short/cover
 */
function normalizeSide(side: string | undefined): string | undefined {
  if (!side) return undefined;
  
  const lower = side.toLowerCase().trim();
  
  const buyTerms = ['buy', 'long', 'enter_long', 'enter long', 'bullish', 'bull', 'open_long', 'open long', 'signal_buy'];
  const sellTerms = ['sell', 'close_long', 'close long', 'bearish', 'bear', 'signal_sell'];
  const shortTerms = ['short', 'enter_short', 'enter short', 'sell_short', 'sell short'];
  const coverTerms = ['cover', 'close_short', 'close short', 'buy_cover', 'buy cover', 'exit_short'];
  
  if (buyTerms.includes(lower)) return 'buy';
  if (sellTerms.includes(lower)) return 'sell';
  if (shortTerms.includes(lower)) return 'short';
  if (coverTerms.includes(lower)) return 'cover';
  
  // Check for partial matches
  if (lower.includes('buy') || lower.includes('long') || lower === 'bull') return 'buy';
  if (lower.includes('short') && !lower.includes('cover') && !lower.includes('close')) return 'short';
  if (lower.includes('cover') || (lower.includes('close') && lower.includes('short'))) return 'cover';
  if (lower.includes('sell') || lower.includes('bear') || lower === 'exit' || lower === 'close') return 'sell';
  
  return undefined;
}