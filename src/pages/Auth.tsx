import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Mail, Lock, UserPlus, LogIn, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  const isRecovery = searchParams.get('recovery') === 'true';
  const isConfirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    if (isRecovery) {
      setActiveTab('reset');
    }
  }, [isRecovery]);

  // Redirect if already authenticated (unless it's a password recovery)
  if (user && !isRecovery) {
    return <Navigate to="/" replace />;
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (!error) {
      setNewPassword('');
      // Redirect to main app after successful password update
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 shadow-lg">
              <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-vogun text-gradient-green tracking-wide">
            FINHUBAFRICA
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Access your financial dashboard
          </p>
        </div>

        <Card className="glass-card border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isRecovery ? 'Reset Password' : 'Welcome'}
            </CardTitle>
            <CardDescription>
              {isRecovery 
                ? 'Enter your new password below' 
                : 'Sign in to your account or create a new one'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email Confirmation Success Message */}
            {isConfirmed && (
              <Alert className="mb-4 border-success/20 bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Your email has been confirmed! You can now sign in to your account.
                </AlertDescription>
              </Alert>
            )}

            {/* Password Recovery Form */}
            {isRecovery && user ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary hover:shadow-glow"
                >
                  {loading ? 'Updating password...' : 'Update Password'}
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signin" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger value="reset" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Reset
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary hover:shadow-glow"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground"
                        onClick={() => setActiveTab('reset')}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <Alert className="mb-4 border-primary/20 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <strong>Free Access Available:</strong> You can explore our platform without signing up, 
                      but creating an account unlocks premium features and saves your preferences.
                    </AlertDescription>
                  </Alert>
                  
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary hover:shadow-glow"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <div className="text-xs text-muted-foreground text-center">
                      By creating an account, you'll receive an email confirmation link.
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="reset">
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <Alert className="border-warning/20 bg-warning/5">
                      <KeyRound className="h-4 w-4 text-warning" />
                      <AlertDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary hover:shadow-glow"
                    >
                      {loading ? 'Sending reset link...' : 'Send Reset Link'}
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground"
                        onClick={() => setActiveTab('signin')}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Secure authentication powered by Supabase
          </p>
          <div className="text-xs text-muted-foreground">
            <Button
              variant="link"
              className="text-xs h-auto p-0"
              onClick={() => window.location.href = '/tools'}
            >
              Continue as guest - 100% Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;