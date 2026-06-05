import { useEffect, useRef, useCallback } from 'react';
import { useClerk } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export function useAuth() {
  const { user } = useClerk();
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSignOut = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    (window as any).Clerk.signOut();
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    navigate('/auth');
  }, [navigate, toast]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Session timeout logic - auto sign out after inactivity
  useEffect(() => {
    if (!user) return;

    // Track user activity
    const activityHandler = () => {
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    // Check session every minute
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      if (inactiveTime >= SESSION_TIMEOUT_MS) {
        handleSignOut();
        toast({
          title: 'Session expired',
          description: 'You have been automatically signed out due to inactivity.',
          variant: 'destructive',
        });
      }
    }, 60 * 1000); // Check every minute

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, activityHandler);
      });
      clearInterval(interval);
    };
  }, [user, handleSignOut, toast, resetTimer]);

  return {
    user,
    loading: !user,
    signIn: () => { window.location.href = '/auth'; },
    signOut: handleSignOut,
  };
}
