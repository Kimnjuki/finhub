import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { X, Sparkles, TrendingUp, Shield, Star } from 'lucide-react';

interface SignUpPromptProps {
  trigger?: 'time' | 'action' | 'feature';
  onDismiss?: () => void;
}

const SignUpPrompt = ({ trigger = 'time', onDismiss }: SignUpPromptProps) => {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is authenticated or prompt is dismissed
  if (user || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getTriggerContent = () => {
    switch (trigger) {
      case 'action':
        return {
          title: "Unlock Premium Features",
          description: "Sign up now to save your preferences and access advanced tools",
          icon: <Sparkles className="h-5 w-5" />
        };
      case 'feature':
        return {
          title: "Premium Feature Detected",
          description: "Create an account to access real-time data and advanced analytics",
          icon: <Star className="h-5 w-5" />
        };
      default:
        return {
          title: "Ready to Level Up?",
          description: "Create your free account to unlock personalized features and save your progress",
          icon: <TrendingUp className="h-5 w-5" />
        };
    }
  };

  const content = getTriggerContent();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <Card className="glass-card border-primary/30 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                {content.icon}
              </div>
              <div>
                <CardTitle className="text-sm">{content.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Free Forever
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-success" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Premium</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="/auth" className="flex-1">
              <Button size="sm" className="w-full btn-primary text-xs">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="text-xs">
                Plans
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              className="text-xs h-auto p-0 text-muted-foreground"
              onClick={handleDismiss}
            >
              Maybe later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPrompt;