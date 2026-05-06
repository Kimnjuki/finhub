-- Create subscription tiers and features tables
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feature access table
CREATE TABLE public.feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  access_level VARCHAR(20) NOT NULL DEFAULT 'basic',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Allow public read access to subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);

-- RLS Policies for feature_access
CREATE POLICY "Users can view their own feature access" 
ON public.feature_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all feature access" 
ON public.feature_access 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role_name = 'admin'
  )
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features) VALUES 
('Free', 'Perfect for beginners exploring financial markets', 0, 0, 
'[
  "Smart Currency Calculator",
  "Basic Market News", 
  "Educational Resources",
  "FAQ Access",
  "Community Support",
  "Limited Market Data (1 day delay)",
  "Basic Portfolio Tracking (1 portfolio)"
]'::jsonb),

('Premium', 'Advanced tools for serious traders and investors', 29, 290,
'[
  "Everything in Free",
  "Real-time Market Data",
  "Advanced Technical Analysis", 
  "Portfolio Analytics Dashboard",
  "Risk Management Tools",
  "Social Trading Signals",
  "Market Sentiment Analysis",
  "Up to 10 Portfolio Tracking",
  "Email Alerts & Notifications",
  "Advanced Charting Tools",
  "Historical Data (5 years)",
  "Priority Email Support"
]'::jsonb),

('VIP', 'Professional-grade platform for expert traders', 99, 990,
'[
  "Everything in Premium",
  "AI-Powered Trading Insights",
  "Unlimited Portfolio Tracking",
  "Advanced API Access", 
  "Custom Technical Indicators",
  "Institutional-Grade Research",
  "1-on-1 Strategy Consultation",
  "White-label Solutions",
  "Priority Phone Support",
  "Dedicated Account Manager",
  "Custom Market Reports",
  "Advanced Risk Analytics",
  "Multi-exchange Integration",
  "Historical Data (20+ years)"
]'::jsonb);

-- Create function to check user subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription_level(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT sp.name 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid 
        AND us.status = 'active'
        AND us.current_period_end > now()
      ORDER BY sp.price_monthly DESC
      LIMIT 1
    ),
    'Free'
  );
$$;

-- Create function to check feature access
CREATE OR REPLACE FUNCTION public.has_feature_access(user_uuid UUID, feature TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN feature = 'calculator' THEN true
    WHEN feature = 'basic_news' THEN true
    WHEN feature = 'education' THEN true
    WHEN feature = 'faq' THEN true
    ELSE EXISTS (
      SELECT 1 FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid 
        AND us.status = 'active'
        AND us.current_period_end > now()
        AND sp.name IN ('Premium', 'VIP')
    )
  END;
$$;