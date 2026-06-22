import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // CORS proxy for development - forwards API requests through Vite's server
    proxy: {
      // Yahoo Finance API - uses rapidapi or yfinance approach
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Yahoo Finance requires a user-agent header
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            proxyReq.setHeader('Accept', '*/*');
            proxyReq.setHeader('Origin', 'https://query1.finance.yahoo.com');
            proxyReq.setHeader('Referer', 'https://query1.finance.yahoo.com/');
          });
          proxy.on('error', (err) => {
            console.error('[Yahoo Proxy] Error:', err.message);
          });
        },
      },
      // CoinDesk Data API
      '/api/coindesk': {
        target: 'https://data-api.coindesk.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coindesk/, ''),
      },
      // Finnhub API
      '/api/finnhub': {
        target: 'https://finnhub.io/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/finnhub/, ''),
      },
      // Polygon.io API
      '/api/polygon': {
        target: 'https://api.polygon.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/polygon/, ''),
      },
      // CoinGecko API (no key required for basic endpoints)
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      },
      // CoinAPI.io
      '/api/coinapi': {
        target: 'https://rest.coinapi.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coinapi/, ''),
      },
      // CoinMarketCap Pro API
      '/api/coinmarketcap': {
        target: 'https://pro-api.coinmarketcap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coinmarketcap/, ''),
      },
      // ExchangeRate API (for forex rates)
      '/api/exchangerate': {
        target: 'https://api.exchangerate-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/exchangerate/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
    ],
    force: true,
  },
}));