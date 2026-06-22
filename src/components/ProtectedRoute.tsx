import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required and user is not logged in, redirect to auth page
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If a specific role is required, check user permissions
  if (requiredRole && user) {
    const userRoles = (user as any).publicMetadata?.roles || [];
    
    // Admin can access everything
    if (!userRoles.includes('admin') && !userRoles.includes(requiredRole)) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="glass-card p-8 rounded-xl border border-red-500/20">
              <h1 className="text-2xl font-bold mb-2 text-red-400">
                Access Denied
              </h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access this page. 
                Required role: {requiredRole}
              </p>
              <a 
                href="/"
                className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}