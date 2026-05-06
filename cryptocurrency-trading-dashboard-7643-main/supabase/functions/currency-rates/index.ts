import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyResponse {
  base: string;
  rates: ExchangeRates;
  timestamp: number; // ms epoch
  success: boolean;
  provider?: string;
}

// In-memory cache keyed by base currency
const ratesCache = new Map<string, { data: CurrencyResponse; ts: number }>();
// Align with UI refresh to avoid blinking
const CACHE_DURATION = 15 * 1000; // 15 seconds

async function fetchLiveRates(base: string): Promise<CurrencyResponse> {
  const url = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error(`Provider error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const timestampSec = typeof json.time_last_updated === "number" ? json.time_last_updated : Math.floor(Date.now() / 1000);
  return {
    base: json.base || base,
    rates: json.rates as ExchangeRates,
    timestamp: timestampSec * 1000,
    success: true,
    provider: "exchangerate-api.com",
  };
}

function filterRates(rates: ExchangeRates, filters: string[]): ExchangeRates {
  if (!filters.length) return rates;
  const out: ExchangeRates = {};
  for (const c of filters) {
    if (rates[c] !== undefined) out[c] = rates[c];
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const baseCurrency = (url.searchParams.get("base") || "USD").toUpperCase();
    const targetCurrencies = (url.searchParams.get("currencies") || "")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    console.log(`[Currency Rates] Incoming -> base=${baseCurrency} targets=${targetCurrencies.join("|")}`);

    // Serve from cache when fresh
    const cacheKey = baseCurrency;
    const cached = ratesCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.ts < CACHE_DURATION) {
      console.log("[Currency Rates] Cache hit");
      const filtered = filterRates(cached.data.rates, targetCurrencies);
      const response: CurrencyResponse = {
        ...cached.data,
        rates: filtered,
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch fresh from provider
    const live = await fetchLiveRates(baseCurrency);
    ratesCache.set(cacheKey, { data: live, ts: now });

    const filtered = filterRates(live.rates, targetCurrencies);
    const response: CurrencyResponse = {
      ...live,
      rates: filtered,
    };

    console.log(`[Currency Rates] Live fetch -> count=${Object.keys(response.rates).length}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Currency Rates] Error", err);

    // On failure try to serve last cached (even if stale)
    const last = Array.from(ratesCache.values()).sort((a, b) => b.ts - a.ts)[0];
    if (last) {
      console.warn("[Currency Rates] Serving stale cache due to error");
      return new Response(JSON.stringify({ ...last.data, success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: (err as Error)?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
