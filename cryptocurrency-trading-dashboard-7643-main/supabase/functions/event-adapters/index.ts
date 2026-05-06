import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedEvent {
  title: string;
  description?: string;
  category: 'macro' | 'crypto' | 'earnings' | 'other';
  symbols?: string[];
  coins?: string[];
  country?: string;
  location?: string;
  start_ts_utc: string;
  end_ts_utc?: string;
  impact?: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'tentative' | 'postponed' | 'canceled' | 'complete';
  source_url: string;
  source_checksum?: string;
  meta?: Record<string, string>;
}

// Economic Calendar Adapter for FXEmpire
class FXEmpireAdapter {
  name = 'FXEmpire';

  async fetchRaw(): Promise<any> {
    console.log('[FXEmpire] Fetching events...');
    
    // Mock data for demonstration - replace with actual API call
    return {
      events: [
        {
          id: "fomc-decision-2024-12",
          title: "Federal Reserve Interest Rate Decision",
          description: "The Federal Open Market Committee announces its decision on the federal funds rate.",
          date: "2024-12-18",
          time: "19:00",
          timezone: "UTC",
          country: "US",
          impact: "high",
          category: "central-bank",
          previous: "5.25%",
          forecast: "5.25%",
          actual: null
        },
        {
          id: "cpi-us-nov-2024",
          title: "US Consumer Price Index (CPI)",
          description: "Monthly inflation data showing changes in prices paid by consumers.",
          date: "2024-12-10",
          time: "13:30",
          timezone: "UTC",
          country: "US",
          impact: "high",
          category: "inflation",
          previous: "2.6%",
          forecast: "2.7%",
          actual: null
        }
      ]
    };
  }

  parse(raw: any): ParsedEvent[] {
    console.log('[FXEmpire] Parsing events...');
    
    return raw.events.map((event: any): ParsedEvent => {
      const startDate = new Date(`${event.date}T${event.time}`);
      
      return {
        title: event.title,
        description: event.description,
        category: this.mapCategory(event.category),
        symbols: event.symbols || [],
        coins: [],
        country: event.country,
        start_ts_utc: startDate.toISOString(),
        impact: event.impact as 'low' | 'medium' | 'high',
        status: 'scheduled',
        source_url: `https://www.fxempire.com/economic-calendar/${event.id}`,
        source_checksum: this.computeChecksum(event),
        meta: {
          'macro:type': event.category,
          'display:color': this.getImpactColor(event.impact),
          'previous': event.previous || '',
          'forecast': event.forecast || '',
          'actual': event.actual || ''
        }
      };
    });
  }

  private mapCategory(fxCategory: string): 'macro' | 'crypto' | 'earnings' | 'other' {
    const categoryMap: Record<string, 'macro' | 'crypto' | 'earnings' | 'other'> = {
      'central-bank': 'macro',
      'inflation': 'macro',
      'employment': 'macro',
      'gdp': 'macro',
      'pmi': 'macro',
      'retail-sales': 'macro'
    };
    return categoryMap[fxCategory] || 'other';
  }

  private getImpactColor(impact: string): string {
    const colors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[impact] || '#6b7280';
  }

  private computeChecksum(event: any): string {
    const checkData = {
      title: event.title,
      date: event.date,
      time: event.time,
      impact: event.impact,
      forecast: event.forecast,
      actual: event.actual
    };
    return btoa(JSON.stringify(checkData));
  }
}

// CoinGecko Adapter for Crypto Events
class CoinGeckoAdapter {
  name = 'CoinGecko';

  async fetchRaw(): Promise<any> {
    console.log('[CoinGecko] Fetching events...');
    
    // Mock crypto events - replace with actual API call
    return {
      events: [
        {
          id: "ethereum-deneb-upgrade",
          title: "Ethereum Dencun Upgrade",
          description: "Major Ethereum upgrade introducing EIP-4844 and other improvements.",
          date: "2024-12-15",
          time: "12:00",
          timezone: "UTC",
          coins: ["ethereum"],
          category: "upgrade",
          impact: "high"
        },
        {
          id: "bitcoin-halving-countdown",
          title: "Bitcoin Halving Countdown",
          description: "Next Bitcoin halving estimated for April 2028.",
          date: "2028-04-20",
          time: "00:00",
          timezone: "UTC",
          coins: ["bitcoin"],
          category: "halving",
          impact: "high"
        }
      ]
    };
  }

  parse(raw: any): ParsedEvent[] {
    console.log('[CoinGecko] Parsing events...');
    
    return raw.events.map((event: any): ParsedEvent => {
      const startDate = new Date(`${event.date}T${event.time}`);
      
      return {
        title: event.title,
        description: event.description,
        category: 'crypto',
        symbols: [],
        coins: event.coins || [],
        start_ts_utc: startDate.toISOString(),
        impact: event.impact as 'low' | 'medium' | 'high',
        status: 'scheduled',
        source_url: `https://www.coingecko.com/events/${event.id}`,
        source_checksum: this.computeChecksum(event),
        meta: {
          'crypto:network': event.coins?.[0] || '',
          'crypto:trigger': event.category,
          'display:color': this.getImpactColor(event.impact)
        }
      };
    });
  }

  private getImpactColor(impact: string): string {
    const colors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[impact] || '#6b7280';
  }

  private computeChecksum(event: any): string {
    const checkData = {
      title: event.title,
      date: event.date,
      category: event.category,
      coins: event.coins
    };
    return btoa(JSON.stringify(checkData));
  }
}

// Main adapter orchestrator
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const source = url.searchParams.get('source');

    console.log(`[Event Adapters] Action: ${action}, Source: ${source}`);

    if (action === 'ingest') {
      const adapters = [
        new FXEmpireAdapter(),
        new CoinGeckoAdapter()
      ];

      const selectedAdapters = source 
        ? adapters.filter(adapter => adapter.name.toLowerCase() === source.toLowerCase())
        : adapters;

      const results = [];

      for (const adapter of selectedAdapters) {
        try {
          console.log(`[${adapter.name}] Starting ingestion...`);
          
          // Fetch raw data
          const rawData = await adapter.fetchRaw();
          
          // Parse events
          const parsedEvents = adapter.parse(rawData);
          
          console.log(`[${adapter.name}] Parsed ${parsedEvents.length} events`);

          // Process each event
          const processedEvents = [];
          
          for (const event of parsedEvents) {
            // Generate unique slug
            const baseSlug = event.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '');
            
            const dateStr = new Date(event.start_ts_utc).toISOString().split('T')[0];
            let slug = `${baseSlug}-${dateStr}`;

            // Check for existing event with same checksum (avoid duplicates)
            const { data: existing } = await supabase
              .from('events')
              .select('id, source_checksum')
              .eq('source_checksum', event.source_checksum)
              .single();

            if (existing) {
              console.log(`[${adapter.name}] Skipping duplicate event: ${event.title}`);
              continue;
            }

            // Ensure unique slug
            let counter = 2;
            while (true) {
              const { data: slugExists } = await supabase
                .from('events')
                .select('id')
                .eq('slug', slug)
                .single();

              if (!slugExists) break;
              slug = `${baseSlug}-${dateStr}-${counter}`;
              counter++;
            }

            // Insert event
            const { data: newEvent, error } = await supabase
              .from('events')
              .insert([{ ...event, slug }])
              .select()
              .single();

            if (error) {
              console.error(`[${adapter.name}] Error inserting event:`, error);
              continue;
            }

            // Insert metadata
            if (event.meta && Object.keys(event.meta).length > 0) {
              const metaEntries = Object.entries(event.meta).map(([key, value]) => ({
                event_id: newEvent.id,
                key,
                value: String(value)
              }));

              await supabase.from('event_meta').insert(metaEntries);
            }

            processedEvents.push(newEvent);
          }

          results.push({
            adapter: adapter.name,
            fetched: parsedEvents.length,
            inserted: processedEvents.length,
            events: processedEvents
          });

        } catch (error) {
          console.error(`[${adapter.name}] Error:`, error);
          results.push({
            adapter: adapter.name,
            error: error.message,
            fetched: 0,
            inserted: 0,
            events: []
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        results,
        summary: {
          totalFetched: results.reduce((sum, r) => sum + (r.fetched || 0), 0),
          totalInserted: results.reduce((sum, r) => sum + (r.inserted || 0), 0),
          adaptersRun: results.length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'list-adapters') {
      return new Response(JSON.stringify({
        adapters: [
          { name: 'FXEmpire', description: 'Economic calendar events', categories: ['macro'] },
          { name: 'CoinGecko', description: 'Cryptocurrency events', categories: ['crypto'] }
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action. Use ?action=ingest or ?action=list-adapters'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Event Adapters] Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});