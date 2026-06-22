import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export function useAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [user] = useState<any>(null); // Auth is disabled, all users are guests

  const handleSignOut = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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
    loading: false, // Always loaded since auth is disabled
    signIn: () => { window.location.href = '/auth'; },
    signOut: handleSignOut,
  };
}