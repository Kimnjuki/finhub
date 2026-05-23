import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="finhubafrica-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <Route path="/markets" element={<Markets />} />
              <Route path="/forex" element={<Forex />} />
              

              {/* Protected Routes - Authentication Required */}
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
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/roles" element={
                <ProtectedRoute>
                  <RoleManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;