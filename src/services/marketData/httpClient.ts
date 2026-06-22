/**
 * Shared HTTP client for market data sources.
 * Routes through the Vite dev server proxy in development to avoid CORS issues.
 * Falls back to mock data gracefully when APIs are unavailable.
 */

// Determine if running in dev mode (Vite dev server with proxy)
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// In dev mode, we route through Vite's proxy; in production, go direct (expect CORS headers)
const PROXY_PREFIXES: Record<string, string> = {
  yahoo: '/api/yahoo',
  coindesk: '/api/coindesk',
  finnhub: '/api/finnhub',
  polygon: '/api/polygon',
  coinapi: '/api/coinapi',
  coingecko: '/api/coingecko',
  coinmarketcap: '/api/coinmarketcap',
  exchangerate: '/api/exchangerate',
};

/**
 * Build a proxy-aware URL for the given API service and path.
 * In dev mode, prepends the Vite proxy prefix so requests stay same-origin.
 */
export function buildProxyUrl(service: string, path: string): string {
  const prefix = PROXY_PREFIXES[service];
  if (isDev && prefix) {
    // If the path is a full URL (contains '://'), extract just the path portion
    if (path.includes('://')) {
      try {
        const parsed = new URL(path);
        return `${prefix}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        // If URL parsing fails, fall through
      }
    }
    // For relative paths or full URLs that weren't parsed, prepend the proxy prefix
    return `${prefix}${path}`;
  }
  // In production, use the direct URL (the caller should pass the full URL)
  return path;
}

/**
 * Fetch wrapper that can route through Vite proxy in development.
 * Does NOT throw on non-OK responses - returns the raw Response so callers can handle errors.
 */
export async function proxyFetch(
  service: string,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const proxyUrl = buildProxyUrl(service, url);

  // For CORS mode, use 'same-origin' in dev since we're proxying through Vite.
  const fetchOptions: RequestInit = {
    ...options,
    mode: isDev ? 'same-origin' : 'cors',
    credentials: 'omit',
  };

  try {
    const response = await fetch(proxyUrl, fetchOptions);
    return response;
  } catch (err) {
    // Network errors (like fetch failures) throw - wrap them as a failed Response
    throw new Error(`Network error fetching ${service} proxy: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Safe JSON fetch with error handling - returns null on failure
 */
export async function safeFetchJSON<T>(
  service: string,
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await proxyFetch(service, url, options);
    if (!response.ok) return null;
    return await response.json() as T;
  } catch (err) {
    console.warn(`[${service}] fetch failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  service: string,
  url: string,
  timeoutMs: number = 10000,
  options?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await proxyFetch(service, url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Timeout fetching ${service} after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}