import { useClerk } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user } = useClerk();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    (window as any).Clerk.signOut();
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    navigate('/auth');
  };

  return {
    user,
    loading: !user,
    signIn: () => { window.location.href = '/auth'; },
    signOut: handleSignOut,
  };
}
