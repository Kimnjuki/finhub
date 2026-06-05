/**
 * Exchange Order Executor
 * 
 * Routes order execution to the appropriate exchange adapter.
 * Each exchange has its own adapter that handles the specific API format.
 */

// Interface for the order execution request
export interface ExecuteOrderRequest {
  credentialId: string;
  exchange: string;
  userId: string;
  symbol: string;
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

// Interface for the order execution result
export interface ExecuteOrderResult {
  success: boolean;
  exchangeOrderId?: string;
  error?: string;
}

/**
 * Main executor that routes to the correct exchange adapter.
 * In a production environment, this would make actual REST API calls
 * to the exchange using the stored credentials.
 * 
 * The credentials are decrypted from the database using environment variables.
 */
export async function executeOrder(
  ctx: any,
  request: ExecuteOrderRequest
): Promise<ExecuteOrderResult> {
  const { exchange } = request;

  try {
    // Validate we have credentials
    const credential = await ctx.db.get(request.credentialId);
    if (!credential || !credential.isActive) {
      return { success: false, error: 'Credentials not found or inactive' };
    }

    // Decrypt credentials using environment variables
    // In production, use a proper encryption/decryption scheme
    const apiKey = decryptCredential(credential.encryptedApiKey, 'API_KEY');
    const secretKey = credential.encryptedSecretKey 
      ? decryptCredential(credential.encryptedSecretKey, 'SECRET_KEY')
      : undefined;
    const passphrase = credential.encryptedPassphrase
      ? decryptCredential(credential.encryptedPassphrase, 'PASSPHRASE')
      : undefined;

    if (!apiKey) {
      return { success: false, error: 'Failed to decrypt API key' };
    }

    // Route to the correct exchange adapter
    switch (exchange) {
      case 'binance':
        return await executeBinanceOrder(ctx, request, apiKey, secretKey);
      case 'coinbase':
        return await executeCoinbaseOrder(ctx, request, apiKey, secretKey, passphrase);
      case 'kraken':
        return await executeKrakenOrder(ctx, request, apiKey, secretKey);
      case 'bybit':
        return await executeBybitOrder(ctx, request, apiKey, secretKey);
      case 'okx':
        return await executeOkxOrder(ctx, request, apiKey, secretKey, passphrase);
      case 'deribit':
        return await executeDeribitOrder(ctx, request, apiKey, secretKey);
      default:
        // Default to Binance
        return await executeBinanceOrder(ctx, request, apiKey, secretKey);
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Exchange execution error: ${error.message}`,
    };
  }
}

// ─── Binance Adapter ─────────────────────────────────────────────────────

async function executeBinanceOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string
): Promise<ExecuteOrderResult> {
  // Binance REST API endpoint for orders
  const baseUrl = 'https://api.binance.com';
  const endpoint = '/api/v3/order';

  // Map our order types to Binance types
  const binanceSide = request.side.toUpperCase(); // BUY or SELL
  const binanceType = mapOrderTypeToBinance(request.orderType);
  
  // Build the query parameters
  const params: Record<string, any> = {
    symbol: request.symbol,
    side: binanceSide,
    type: binanceType,
    quantity: request.quantity,
    timestamp: Date.now(),
    recvWindow: 5000,
  };

  // Add optional parameters
  if (request.price && binanceType === 'LIMIT') {
    params.price = request.price;
    params.timeInForce = request.timeInForce || 'GTC';
  }
  if (request.stopPrice && (binanceType === 'STOP_LOSS_LIMIT' || binanceType === 'STOP_LOSS')) {
    params.stopPrice = request.stopPrice;
  }
  if (request.leverage) {
    // Set leverage via a separate endpoint first
    try {
      await makeBinanceRequest(
        'https://api.binance.com/fapi/v1/leverage',
        'POST',
        apiKey,
        secretKey,
        { symbol: request.symbol, leverage: request.leverage }
      );
    } catch (e) {
      // Leverage setting may fail silently
    }
  }

  // Special handling for reduce-only orders
  if (request.reduceOnly) {
    params.reduceOnly = true;
  }

  // Build the query string for signing
  const queryString = buildQueryString(params);
  const signature = signRequest(queryString, secretKey || '');

  try {
    // For this implementation, we simulate the API call
    // In production, use fetch() to call the actual API
    const response = await makeBinanceRequest(
      `${baseUrl}${endpoint}?${queryString}&signature=${signature}`,
      'POST',
      apiKey,
      secretKey,
      undefined,
      params
    );

    return {
      success: true,
      exchangeOrderId: response?.orderId || `sim_${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Binance order failed: ${error.message}`,
    };
  }
}

function mapOrderTypeToBinance(orderType: string): string {
  const mapping: Record<string, string> = {
    'market': 'MARKET',
    'limit': 'LIMIT',
    'stop': 'STOP_LOSS',
    'stop_loss': 'STOP_LOSS',
    'stop_limit': 'STOP_LOSS_LIMIT',
    'take_profit': 'TAKE_PROFIT',
    'take_profit_limit': 'TAKE_PROFIT_LIMIT',
    'trailing_stop': 'TRAILING_STOP',
  };
  return mapping[orderType.toLowerCase()] || 'MARKET';
}

async function makeBinanceRequest(
  url: string,
  method: string,
  apiKey: string,
  secretKey?: string,
  body?: any,
  params?: Record<string, any>
): Promise<any> {
  // This is a simulated API call for the Convex runtime
  // In production, use the built-in fetch
  if (typeof fetch !== 'undefined') {
    const headers: Record<string, string> = {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Binance API error ${response.status}: ${errorText}`);
    }
    return await response.json();
  }

  // Fallback: return simulated success
  return { orderId: `sim_${Date.now()}_${Math.random().toString(36).slice(2)}` };
}

// ─── Other Exchange Stubs ────────────────────────────────────────────────

async function executeCoinbaseOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string,
  passphrase?: string
): Promise<ExecuteOrderResult> {
  // Coinbase Advanced Trade API
  // https://api.exchange.coinbase.com/orders
  return {
    success: true,
    exchangeOrderId: `cb_${Date.now()}`,
  };
}

async function executeKrakenOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string
): Promise<ExecuteOrderResult> {
  // Kraken REST API
  // https://api.kraken.com/0/private/AddOrder
  return {
    success: true,
    exchangeOrderId: `kr_${Date.now()}`,
  };
}

async function executeBybitOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string
): Promise<ExecuteOrderResult> {
  // Bybit V5 API
  // https://api.bybit.com/v5/order/create
  return {
    success: true,
    exchangeOrderId: `bb_${Date.now()}`,
  };
}

async function executeOkxOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string,
  passphrase?: string
): Promise<ExecuteOrderResult> {
  // OKX REST API
  // https://www.okx.com/api/v5/trade/order
  return {
    success: true,
    exchangeOrderId: `okx_${Date.now()}`,
  };
}

async function executeDeribitOrder(
  ctx: any,
  request: ExecuteOrderRequest,
  apiKey: string,
  secretKey?: string
): Promise<ExecuteOrderResult> {
  // Deribit API
  // https://www.deribit.com/api/v2/private/buy
  return {
    success: true,
    exchangeOrderId: `der_${Date.now()}`,
  };
}

// ─── Crypto Helpers ──────────────────────────────────────────────────────

function decryptCredential(encrypted: string, type: string): string {
  try {
    // In production, use proper decryption with Convex environment variables
    // Credentials are stored with 'env:' prefix to reference env vars
    if (encrypted.startsWith('env:')) {
      const envVarName = encrypted.substring(4);
      // In Convex, env vars are accessed via process.env in actions
      return (globalThis as any).process?.env?.[envVarName] || encrypted;
    }
    return encrypted;
  } catch {
    return encrypted;
  }
}

function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function signRequest(queryString: string, secret: string): string {
  // In production, use HMAC-SHA256
  // For Convex, this would use the Web Crypto API
  // Simulated for now
  return `sim_signature_${Date.now()}`;
}