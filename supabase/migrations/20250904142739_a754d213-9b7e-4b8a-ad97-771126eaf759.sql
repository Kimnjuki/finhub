-- Create custom enum types for events
CREATE TYPE event_status AS ENUM ('scheduled', 'tentative', 'postponed', 'canceled', 'complete');
CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE event_category AS ENUM ('macro', 'crypto', 'earnings', 'other');

-- Create events table with comprehensive structure
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category event_category NOT NULL,
    symbols TEXT[],
    coins TEXT[],
    country TEXT,
    location TEXT,
    start_ts_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    end_ts_utc TIMESTAMP WITH TIME ZONE,
    impact impact_level DEFAULT 'low',
    status event_status DEFAULT 'scheduled',
    source_url TEXT,
    source_checksum TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_checked_at TIMESTAMP WITH TIME ZONE
);

-- Create event_meta table for flexible metadata
CREATE TABLE public.event_meta (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL
);

-- Create event_sources table
CREATE TABLE public.event_sources (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    base_url TEXT,
    reliability INTEGER DEFAULT 100
);

-- Create event_source_map table
CREATE TABLE public.event_source_map (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    source_id BIGINT NOT NULL REFERENCES public.event_sources(id)
);

-- Create event_subscriptions table
CREATE TABLE public.event_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
    lead_times INTEGER[] NOT NULL DEFAULT ARRAY[1440, 60, 10],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follows table for user preferences
CREATE TABLE public.follows (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    symbol TEXT,
    coin TEXT,
    category event_category,
    impact impact_level,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_events_start_ts ON public.events(start_ts_utc);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_country ON public.events(country);
CREATE INDEX idx_events_symbols ON public.events USING GIN(symbols);
CREATE INDEX idx_events_coins ON public.events USING GIN(coins);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_event_meta_event_id ON public.event_meta(event_id);
CREATE INDEX idx_event_meta_key ON public.event_meta(key);
CREATE INDEX idx_event_subscriptions_user_id ON public.event_subscriptions(user_id);
CREATE INDEX idx_follows_user_id ON public.follows(user_id);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_source_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events (public read access)
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT USING (true);

-- Create RLS policies for event_meta (public read access)
CREATE POLICY "Event meta is publicly readable" ON public.event_meta FOR SELECT USING (true);

-- Create RLS policies for event_sources (public read access)  
CREATE POLICY "Event sources are publicly readable" ON public.event_sources FOR SELECT USING (true);

-- Create RLS policies for event_source_map (public read access)
CREATE POLICY "Event source map is publicly readable" ON public.event_source_map FOR SELECT USING (true);

-- Create RLS policies for event_subscriptions (users can manage their own)
CREATE POLICY "Users can manage their own event subscriptions" ON public.event_subscriptions 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for follows (users can manage their own)
CREATE POLICY "Users can manage their own follows" ON public.follows 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample event sources
INSERT INTO public.event_sources (name, base_url, reliability) VALUES
('Federal Reserve', 'https://www.federalreserve.gov', 100),
('European Central Bank', 'https://www.ecb.europa.eu', 100),
('Bank of England', 'https://www.bankofengland.co.uk', 100),
('CoinDesk', 'https://www.coindesk.com', 90),
('Bloomberg', 'https://www.bloomberg.com', 95);

-- Insert sample events
INSERT INTO public.events (slug, title, category, country, start_ts_utc, impact, status, source_url, description) VALUES
('fomc-rate-decision-2025-01-29', 'FOMC Rate Decision', 'macro', 'US', '2025-01-29 19:00:00+00', 'high', 'scheduled', 'https://www.federalreserve.gov/monetarypolicy.htm', 'Federal Open Market Committee announces interest rate decision and monetary policy stance.'),
('ecb-rate-decision-2025-01-30', 'ECB Interest Rate Decision', 'macro', 'EU', '2025-01-30 12:45:00+00', 'high', 'scheduled', 'https://www.ecb.europa.eu', 'European Central Bank announces key interest rates and monetary policy decisions.'),
('bitcoin-halving-projection-2028', 'Bitcoin Halving (Projected)', 'crypto', NULL, '2028-05-04 00:00:00+00', 'high', 'tentative', 'https://www.blockchain.com', 'Projected Bitcoin block reward halving event, reducing mining rewards by 50%.'),
('us-nonfarm-payrolls-2025-02-07', 'US Non-Farm Payrolls', 'macro', 'US', '2025-02-07 13:30:00+00', 'high', 'scheduled', 'https://www.bls.gov', 'Monthly employment report showing job creation and unemployment rate.'),
('ethereum-dencun-upgrade', 'Ethereum Dencun Upgrade Anniversary', 'crypto', NULL, '2025-03-13 00:00:00+00', 'medium', 'scheduled', 'https://ethereum.org', 'Anniversary of major Ethereum network upgrade bringing EIP-4844 and proto-danksharding.');

-- Insert sample event metadata
INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'macro:type', 'FOMC' FROM public.events WHERE slug = 'fomc-rate-decision-2025-01-29';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'macro:type', 'ECB' FROM public.events WHERE slug = 'ecb-rate-decision-2025-01-30';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'crypto:network', 'bitcoin' FROM public.events WHERE slug = 'bitcoin-halving-projection-2028';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'crypto:trigger', 'halving' FROM public.events WHERE slug = 'bitcoin-halving-projection-2028';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'macro:type', 'Payrolls' FROM public.events WHERE slug = 'us-nonfarm-payrolls-2025-02-07';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'crypto:network', 'ethereum' FROM public.events WHERE slug = 'ethereum-dencun-upgrade';

INSERT INTO public.event_meta (event_id, key, value)
SELECT id, 'crypto:trigger', 'upgrade' FROM public.events WHERE slug = 'ethereum-dencun-upgrade';