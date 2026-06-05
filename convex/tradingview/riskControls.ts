/**
 * Risk Control System for TradingView Webhook Trading
 * 
 * Enforces config-level risk limits including:
 * - Max order size (per order)
 * - Max notional value (per order)
 * - Daily order count limits
 * - Daily volume limits
 */

interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check all risk controls before allowing an order to proceed.
 */
export async function checkRiskControls(
  ctx: any,
  userId: string,
  config: any,
  orderParams: any
): Promise<RiskCheckResult> {
  // 1. Check max order size
  if (config.maxOrderSize && orderParams.quantity > config.maxOrderSize) {
    return {
      allowed: false,
      reason: `Order size ${orderParams.quantity} exceeds max order size ${config.maxOrderSize}`,
    };
  }

  // 2. Check max notional value
  if (config.maxNotional && orderParams.price) {
    const notional = orderParams.quantity * orderParams.price;
    if (notional > config.maxNotional) {
      return {
        allowed: false,
        reason: `Notional ${notional.toFixed(2)} exceeds max notional ${config.maxNotional}`,
      };
    }
  }

  // 3. Check daily limits
  const today = new Date().toISOString().split('T')[0];
  const dailyStats = await ctx.db.query("tvDailyStats")
    .withIndex("by_user_and_date", (q: any) =>
      q.eq("userId", userId).eq("date", today)
    )
    .first();

  if (dailyStats) {
    // Check daily order count limit
    if (config.dailyOrderLimit && dailyStats.orderCount >= config.dailyOrderLimit) {
      return {
        allowed: false,
        reason: `Daily order limit of ${config.dailyOrderLimit} reached (${dailyStats.orderCount} placed)`,
      };
    }

    // Check daily volume limit
    if (config.dailyVolumeLimit && orderParams.price) {
      const newVolume = dailyStats.totalVolume + (orderParams.quantity * orderParams.price);
      if (newVolume > config.dailyVolumeLimit) {
        return {
          allowed: false,
          reason: `Daily volume limit of ${config.dailyVolumeLimit} would be exceeded`,
        };
      }
    }
  }

  // 4. Skip trading if no quantity specified
  if (!orderParams.quantity || orderParams.quantity <= 0) {
    return {
      allowed: false,
      reason: 'Order quantity is zero or negative',
    };
  }

  // All checks passed
  return { allowed: true };
}