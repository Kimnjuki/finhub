import { action } from "convex/server";
// Import API endpoints
import * as instrumentsApi from "./api/instruments";
import * as marketDataApi from "./api/marketData";
import * as eventsApi from "./api/events";
import * as alertsApi from "./api/alerts";
import * as watchlistsApi from "./api/watchlists";
// Middleware to validate API keys for HTTP actions
export const validateApiKey = action({
    async handler(ctx, { req }) {
        const authHeader = req.headers?.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { valid: false, reason: "Missing or malformed Authorization header" };
        }
        const apiKey = authHeader.substring(7); // remove "Bearer " prefix
        // Check if the API key exists and is active
        const key = await ctx.db.get("apiKeys", apiKey);
        if (!key || !key.isActive) {
            return { valid: false, reason: "Invalid or inactive API key" };
        }
        // Check expiration
        if (key.expiresAt && key.expiresAt < Date.now()) {
            return { valid: false, reason: "API key expired" };
        }
        // Check rate limits (simplified)
        const rateLimitKey = `${key.userId}:api:${key._id}`;
        let rateLimitCount = await ctx.db.get("rateLimits", rateLimitKey) || { count: 0 };
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 minute window
        const windowStart = Math.floor(now / windowSize) * windowSize;
        if (rateLimitCount.count && rateLimitCount.windowStart === windowStart && rateLimitCount.count >= 100) {
            return { valid: false, reason: "Rate limit exceeded" };
        }
        // Update rate limit count
        if (rateLimitCount.windowStart === windowStart) {
            rateLimitCount.count++;
        }
        else {
            rateLimitCount = { windowKey: `${key.userId}:api:${key._id}:${windowStart}`, count: 1, windowStartAt: now };
        }
        await ctx.db.insert("rateLimits", rateLimitCount);
        return { valid: true, userId: key.userId, scopes: key.scopes || [] };
    },
});
// Middleware to check entitlements for API endpoints
export const checkEndpointEntitlements = action({
    async handler({ userId, endpoint }) {
        // This would check the user's access level for the specific endpoint
        // For now, we'll just return allowed
        return { allowed: true };
    },
});
// Main API router - routes all API requests
export const apiRouter = action({
    async handler(ctx, { req, res }) {
        // Validate API key first
        const keyValidation = await ctx.run(validateApiKey, { req });
        if (!keyValidation.valid) {
            res.status(401).json({ error: keyValidation.reason });
            return;
        }
        const { userId, scopes } = keyValidation;
        const { method, path } = req;
        console.log(`API Request: ${method} ${path} from user ${userId}`);
        // Route based on path
        switch (path) {
            // Instruments
            case "/v1/instruments":
                if (method === "GET") {
                    const instruments = await ctx.run(instrumentsApi.getInstruments, {
                        assetClass: req.query.assetClass,
                        exchange: req.query.exchange,
                        limit: parseInt(req.query.limit) || 100,
                        cursorMark: parseInt(req.query.cursorMark),
                    });
                    res.json(instruments);
                    return;
                }
                break;
            case "/v1/instruments/:symbol":
                if (method === "GET") {
                    const instrument = await ctx.run(instrumentsApi.getInstrument, {
                        symbol: req.params.symbol,
                    });
                    if (!instrument) {
                        res.status(404).json({ error: "Instrument not found" });
                    }
                    else {
                        res.json(instrument);
                    }
                    return;
                }
                break;
            // Market Data
            case "/v1/instruments/:symbol/ticker":
                if (method === "GET") {
                    const ticker = await ctx.run(marketDataApi.getTicker, {
                        symbol: req.params.symbol,
                    });
                    res.json(ticker);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/ohlcv":
                if (method === "GET") {
                    const ohlcv = await ctx.run(marketDataApi.getOhlcv, {
                        symbol: req.params.symbol,
                        interval: req.query.interval || "1h",
                        limit: parseInt(req.query.limit) || 200,
                    });
                    res.json(ohlcv);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/orderbook":
                if (method === "GET") {
                    const orderbook = await ctx.run(marketDataApi.getOrderBook, {
                        symbol: req.params.symbol,
                        level: req.query.level || "l2",
                    });
                    res.json(orderbook);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/trades":
                if (method === "GET") {
                    const trades = await ctx.run(marketDataApi.getTrades, {
                        symbol: req.params.symbol,
                        limit: parseInt(req.query.limit) || 50,
                    });
                    res.json(trades);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/funding":
                if (method === "GET") {
                    const funding = await ctx.run(marketDataApi.getFundingRates, {
                        symbol: req.params.symbol,
                        limit: parseInt(req.query.limit) || 10,
                    });
                    res.json(funding);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/open-interest":
                if (method === "GET") {
                    const openInterest = await ctx.run(marketDataApi.getOpenInterest, {
                        symbol: req.params.symbol,
                        limit: parseInt(req.query.limit) || 10,
                    });
                    res.json(openInterest);
                    return;
                }
                break;
            case "/v1/instruments/:symbol/signals":
                if (method === "GET") {
                    const signals = await ctx.run(marketDataApi.getSignals, {
                        symbol: req.params.symbol,
                        limit: parseInt(req.query.limit) || 20,
                    });
                    res.json(signals);
                    return;
                }
                break;
            // Events & News
            case "/v1/events":
                if (method === "GET") {
                    const events = await ctx.run(eventsApi.getEvents, {
                        category: req.query.category,
                        limit: parseInt(req.query.limit) || 20,
                        afterTs: parseInt(req.query.afterTs),
                    });
                    res.json(events);
                    return;
                }
                break;
            case "/v1/news":
                if (method === "GET") {
                    const news = await ctx.run(eventsApi.getNews, {
                        coins: req.query.coins ? req.query.coins.split(",") : undefined,
                        limit: parseInt(req.query.limit) || 20,
                        afterPublished: parseInt(req.query.afterPublished),
                    });
                    res.json(news);
                    return;
                }
                break;
            // Alerts
            case "/v1/alerts":
                if (method === "POST") {
                    const alert = await ctx.run(alertsApi.createAlert, {
                        userId,
                        instrumentId: req.body.instrumentId,
                        type: req.body.type,
                        conditionConfig: req.body.conditionConfig,
                        deliveryChannels: req.body.deliveryChannels || ["in_app"],
                        cooldownSeconds: req.body.cooldownSeconds,
                        expiresAt: req.body.expiresAt,
                    });
                    res.status(201).json(alert);
                    return;
                }
                else if (method === "GET") {
                    const alerts = await ctx.run(alertsApi.getAlerts, {
                        userId,
                        instrumentId: req.query.instrumentId,
                        limit: parseInt(req.query.limit) || 50,
                    });
                    res.json(alerts);
                    return;
                }
                else if (method === "DELETE") {
                    // Assuming DELETE would be for a specific alert ID, but we'll implement that separately
                    res.status(405).json({ error: "Method not allowed" });
                    return;
                }
                break;
            case "/v1/alerts/:alertId":
                if (method === "DELETE") {
                    const result = await ctx.run(alertsApi.deleteAlert, {
                        alertId: req.params.alertId,
                    });
                    res.json(result);
                    return;
                }
                break;
            // Watchlists
            case "/v1/watchlists":
                if (method === "POST") {
                    const watchlist = await ctx.run(watchlistsApi.createWatchlist, {
                        userId,
                        name: req.body.name,
                        description: req.body.description,
                        isPublic: req.body.isPublic,
                        color: req.body.color,
                    });
                    res.status(201).json(watchlist);
                    return;
                }
                else if (method === "GET") {
                    const watchlists = await ctx.run(watchlistsApi.getWatchlists, {
                        userId,
                    });
                    res.json(watchlists);
                    return;
                }
                break;
            case "/v1/watchlists/:watchlistId/instruments":
                if (method === "POST") {
                    const result = await ctx.run(watchlistsApi.addToWatchlist, {
                        watchlistId: req.params.watchlistId,
                        instrumentId: req.body.instrumentId,
                    });
                    res.json(result);
                    return;
                }
                else if (method === "DELETE") {
                    const result = await ctx.run(watchlistsApi.removeFromWatchlist, {
                        watchlistId: req.params.watchlistId,
                        instrumentId: req.body.instrumentId,
                    });
                    res.json(result);
                    return;
                }
                break;
            default:
                res.status(404).json({ error: "Endpoint not found" });
                return;
        }
    },
});
