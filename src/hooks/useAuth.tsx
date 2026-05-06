import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

export interface ConvexUser {
  id: string;
  email: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: ConvexUser | null;
  session: ConvexUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const SESSION_KEY = 'finhubafrica_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<ConvexUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signUpMutation = useMutation(api.auth.signUp);
  const signInMutation = useMutation(api.auth.signIn);
  const updatePasswordMutation = useMutation(api.auth.updatePassword);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConvexUser;
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpMutation({ email, password });
      const newUser: ConvexUser = {
        id: result.userId as string,
        email: result.email,
        isVerified: false,
      };
      setUser(newUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      toast({
        title: 'Account Created Successfully!',
        description: 'You can now access all exclusive features on the platform.',
        duration: 5000,
      });
      return { error: null };
    } catch (err: any) {
      const message: string = err?.message ?? 'Sign up failed';
      if (message.includes('already registered')) {
        toast({
          title: 'Account Already Exists',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Sign Up Error', description: message, variant: 'destructive' });
      }
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password });
      const loggedIn: ConvexUser = {
        id: result.userId as string,
        email: result.email,
        isVerified: result.isVerified,
      };
      setUser(loggedIn);
      localStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
      return { error: null };
    } catch (err: any) {
      const message: string = err?.message ?? 'Sign in failed';
      if (message.includes('Invalid login credentials')) {
        toast({
          title: 'Invalid Credentials',
          description: 'Please check your email and password and try again.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Sign In Error', description: message, variant: 'destructive' });
      }
      return { error: err };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
  };

  const resetPassword = async (email: string) => {
    // Email sending not yet wired up — notify user
    toast({
      title: 'Password Reset',
      description: `If an account exists for ${email}, you can reset your password by contacting support.`,
      duration: 6000,
    });
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      await updatePasswordMutation({
        userId: user.id as any,
        newPassword: password,
      });
      toast({ title: 'Password Updated Successfully', description: 'Your password has been updated.' });
      return { error: null };
    } catch (err: any) {
      toast({ title: 'Password Update Error', description: err?.message, variant: 'destructive' });
      return { error: err };
    }
  };

  const value: AuthContextType = {
    user,
    session: user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
