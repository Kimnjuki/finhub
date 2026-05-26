import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MarketDataProvider } from './contexts/MarketDataContext'
import App from './App.tsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const queryClient = new QueryClient()
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <ConvexProvider client={convex}>
        <MarketDataProvider>
          <App />
        </MarketDataProvider>
      </ConvexProvider>
    </QueryClientProvider>
  </ClerkProvider>
);
