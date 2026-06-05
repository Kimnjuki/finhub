import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code splitting
const Index = React.lazy(() => import('./pages/Index'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Tools = React.lazy(() => import('./pages/Tools'));
const Products = React.lazy(() => import('./pages/Products'));
const News = React.lazy(() => import('./pages/News'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Events = React.lazy(() => import('./pages/Events'));
const EventDetailPage = React.lazy(() => import('./components/EventDetailPage'));
const RoleManagement = React.lazy(() => import('./pages/RoleManagement'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const About = React.lazy(() => import('./pages/About'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Forex = React.lazy(() => import('./pages/Forex'));
const AIPredictions = React.lazy(() => import('./pages/AIPredictions'));
const Trading = React.lazy(() => import('./pages/Trading'));
const Markets = React.lazy(() => import('./pages/Markets'));
const Subscriptions = React.lazy(() => import('./pages/Subscriptions'));
const DataSourceTrustPanel = React.lazy(() => import('./components/admin/DataSourceTrustPanel'));

// Coinbase-Grade Feature Pages
const MobileMoney = React.lazy(() => import('./pages/mobile-money/MobileMoney'));
const P2PMarketplace = React.lazy(() => import('./pages/p2p/P2PMarketplace'));
const VaultPage = React.lazy(() => import('./pages/vault/VaultPage'));
const LearnAndEarn = React.lazy(() => import('./pages/learn/LearnAndEarn'));
const RecurringBuys = React.lazy(() => import('./pages/recurring/RecurringBuys'));
const SocialTrading = React.lazy(() => import('./pages/social/SocialTrading'));

// 404 Page
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="finhubafrica-theme">
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Public Routes - No Authentication Required */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/forex" element={<Forex />} />
              
              {/* Authenticated Routes - Login Required */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/ai-predictions" element={
                <ProtectedRoute>
                  <AIPredictions />
                </ProtectedRoute>
              } />
              <Route path="/trading" element={
                <ProtectedRoute>
                  <Trading />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Admin Role Required */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/roles" element={
                <ProtectedRoute requiredRole="admin">
                  <RoleManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/infrastructure" element={
                <ProtectedRoute requiredRole="admin">
                  <DataSourceTrustPanel />
                </ProtectedRoute>
              } />
              
              {/* Coinbase-Grade Feature Routes - Login Required */}
              <Route path="/mobile-money" element={
                <ProtectedRoute>
                  <MobileMoney />
                </ProtectedRoute>
              } />
              <Route path="/p2p" element={
                <ProtectedRoute>
                  <P2PMarketplace />
                </ProtectedRoute>
              } />
              <Route path="/vault" element={
                <ProtectedRoute>
                  <VaultPage />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <LearnAndEarn />
                </ProtectedRoute>
              } />
              <Route path="/recurring" element={
                <ProtectedRoute>
                  <RecurringBuys />
                </ProtectedRoute>
              } />
              <Route path="/social-trading" element={
                <ProtectedRoute>
                  <SocialTrading />
                </ProtectedRoute>
              } />
              <Route path="/invest" element={
                <ProtectedRoute>
                  <RecurringBuys />
                </ProtectedRoute>
              } />
              <Route path="/earn" element={
                <ProtectedRoute>
                  <LearnAndEarn />
                </ProtectedRoute>
              } />
              
              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;