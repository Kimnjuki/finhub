import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Tools from './pages/Tools';
import Products from './pages/Products';
import News from './pages/News';
import FAQ from './pages/FAQ';
import Auth from './pages/Auth';
import Pricing from './pages/Pricing';
import Events from './pages/Events';
import EventDetailPage from './components/EventDetailPage';
import RoleManagement from './pages/RoleManagement';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Forex from './pages/Forex';

import AIPredictions from './pages/AIPredictions';
import Trading from './pages/Trading';
import Markets from './pages/Markets';
import Subscriptions from './pages/Subscriptions';
import DataSourceTrustPanel from './components/admin/DataSourceTrustPanel';

// Coinbase-Grade Feature Pages
import MobileMoney from './pages/mobile-money/MobileMoney';
import P2PMarketplace from './pages/p2p/P2PMarketplace';
import VaultPage from './pages/vault/VaultPage';
import LearnAndEarn from './pages/learn/LearnAndEarn';
import RecurringBuys from './pages/recurring/RecurringBuys';
import SocialTrading from './pages/social/SocialTrading';

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="finhubafrica-theme">
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <BrowserRouter>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-predictions" element={<AIPredictions />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/roles" element={<RoleManagement />} />
          <Route path="/admin/infrastructure" element={<DataSourceTrustPanel />} />
          
          {/* Coinbase-Grade Feature Routes */}
          <Route path="/mobile-money" element={<MobileMoney />} />
          <Route path="/p2p" element={<P2PMarketplace />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/learn" element={<LearnAndEarn />} />
          <Route path="/recurring" element={<RecurringBuys />} />
          <Route path="/social-trading" element={<SocialTrading />} />
          <Route path="/invest" element={<RecurringBuys />} />
          <Route path="/earn" element={<LearnAndEarn />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;