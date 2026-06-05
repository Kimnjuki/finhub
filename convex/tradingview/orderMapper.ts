/**
 * Alert-to-Order Mapping Logic
 * 
 * Transforms a parsed TradingView alert into executable order parameters.
 * Applies config-level static overrides and dynamic field mappings.
 */

export interface OrderParams {
  success: true;
  side: string;
  orderType: string;
  quantity: number;
  price?: number;
  stopPrice?: number;
  limitPrice?: number;
  timeInForce?: string;
  leverage?: number;
  reduceOnly?: boolean;
}

export interface OrderParamsError {
  success: false;
  error: string;
}

export type OrderParamsResult = OrderParams | OrderParamsError;

/**
 * Map a parsed TradingView alert to executable order parameters.
 * Combines parsed fields with config-level overrides and mappings.
 */
export function mapAlertToOrder(
  parsed: any, 
  config: any,
  resolvedSymbol: string
): OrderParamsResult {
  // Determine side
  const side = parsed.side || 'buy';

  // Determine order type
  let orderType = parsed.orderType || config.defaultOrderType || 'market';
  
  // Determine quantity
  let quantity = parsed.quantity || 0;

  // Apply max order size cap from config
  if (config.maxOrderSize && quantity > config.maxOrderSize) {
    quantity = config.maxOrderSize;
  }

  // Determine prices
  let price = parsed.price;
  let stopPrice: number | undefined;
  let limitPrice: number | undefined;

  // Handle different order types
  switch (orderType) {
    case 'limit':
      price = parsed.price;
      if (!price || price <= 0) {
        return { success: false, error: 'Limit orders require a price' };
      }
      break;

    case 'stop':
      stopPrice = parsed.stopPrice || parsed.price;
      price = undefined; // Market order when stop is triggered
      if (!stopPrice || stopPrice <= 0) {
        return { success: false, error: 'Stop orders require a stop price' };
      }
      break;

    case 'stop_limit':
      stopPrice = parsed.stopPrice;
      limitPrice = parsed.price;
      if (!stopPrice || !limitPrice) {
        return { success: false, error: 'Stop-limit orders require both stop and limit prices' };
      }
      break;

    case 'market':
    default:
      price = undefined; // Market order, price is determined by exchange
      break;
  }

  // Time in force
  let timeInForce = config.defaultTimeInForce || 'GTC';
  if (orderType === 'market' && !timeInForce) {
    timeInForce = 'IOC'; // Market orders default to IOC
  }

  // Leverage (for derivatives)
  let leverage: number | undefined;
  if (config.maxLeverage && config.maxLeverage > 1) {
    leverage = Math.min(config.maxLeverage, 100); // Cap at 100x
  }

  // Determine if reduce-only (for closing positions)
  let reduceOnly: boolean | undefined;
  const sideLower = side.toLowerCase();
  if (sideLower === 'sell' || sideLower === 'cover') {
    reduceOnly = false; // Default to not reduce-only unless signaled
  }

  // Override side for short positions
  let finalSide = side;
  if (parsed.side === 'short') {
    finalSide = 'sell';
  } else if (parsed.side === 'cover') {
    finalSide = 'buy';
  }

  return {
    success: true,
    side: finalSide,
    orderType,
    quantity,
    price,
    stopPrice,
    limitPrice,
    timeInForce,
    leverage,
    reduceOnly,
  };
}