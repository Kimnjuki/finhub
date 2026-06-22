import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function useAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user] = useState<any>(null);

  const handleSignOut = async () => {
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    navigate('/auth');
  };

  return {
    user,
    loading: false,
    signIn: () => { window.location.href = '/auth'; },
    signOut: handleSignOut,
  };
}