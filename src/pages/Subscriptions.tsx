import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Zap, Crown, Building2, ArrowRight, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Plan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
}

const PlansPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const plans = useQuery(api.subscriptions.getPlans);
  const userSubscription = useQuery(
    api.subscriptions.getUserSubscription,
    user ? { userId: user.id } : 'skip'
  );
  const subscribeToPlan = useMutation(api.subscriptions.subscribeToPlan);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view subscription plans.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubscribe = async (planName: string) => {
    try {
      await subscribeToPlan({
        userId: user.id,
        planName,
        billingCycle,
      });
    } catch (error: any) {
      console.error('Subscription failed:', error);
    }
  };

  const getPlanIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'free': return <Star className="h-6 w-6 text-muted-foreground" />;
      case 'trader': return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'pro': return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise': return <Building2 className="h-6 w-6 text-blue-500" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'free': return 'border-muted';
      case 'trader': return 'border-yellow-500/50';
      case 'pro': return 'border-purple-500/50';
      case 'enterprise': return 'border-blue-500/50';
      default: return 'border-muted';
    }
  };

  const currentPlan = userSubscription?.plan?.name || 'Free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Unlock the full power of FinHubAfrica's market intelligence platform
          </p>
          
          {/* Billing Toggle */}
          <Tabs value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)} className="inline-flex">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">Save 27%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Current Plan Badge */}
        {userSubscription && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="text-sm py-2 px-4">
              Current Plan: <span className="font-bold ml-1">{currentPlan}</span>
            </Badge>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan: Plan) => {
            const isCurrentPlan = currentPlan === plan.name;
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            
            return (
              <Card 
                key={plan._id} 
                className={`relative ${getPlanColor(plan.name)} ${
                  isCurrentPlan ? 'ring-2 ring-primary' : ''
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${price}</span>
                        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || plan.name === 'Enterprise'}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : (
                      <>
                        {billingCycle === 'yearly' ? `$${plan.priceYearly}/yr` : `$${plan.priceMonthly}/mo`}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise Notice */}
        <Card className="mt-12 border-blue-500/30">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Need a custom solution?</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise plans with custom data sources, dedicated support, and SLA guarantees available.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/contact'}>
              Contact Sales
            </Button>
          </CardContent>
        </Card>

        {/* Africa Special */}
        <Card className="mt-6 border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Star className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">🌍 Africa-First Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  KES/NGN/ZAR-denominated plans available at 30-50% discount for local market subscribers. 
                  Pay with M-Pesa, Flutterwave, or Chipper Cash.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlansPage;