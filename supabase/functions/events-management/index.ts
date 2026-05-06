import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`[Events API] ${method} ${path}`);

    // Events CRUD endpoints
    if (path.startsWith('/events-management/events')) {
      const eventId = path.split('/')[3];

      switch (method) {
        case 'GET':
          if (eventId) {
            // Get single event
            const { data: event, error } = await supabase
              .from('events')
              .select(`
                *,
                event_meta (key, value),
                event_subscriptions (
                  id,
                  user_id,
                  channels,
                  lead_times
                )
              `)
              .eq('id', eventId)
              .single();

            if (error) throw error;
            return new Response(JSON.stringify(event), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            // Get events with filters
            const category = url.searchParams.get('category');
            const impact = url.searchParams.get('impact');
            const country = url.searchParams.get('country');
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const offset = parseInt(url.searchParams.get('offset') || '0');

            let query = supabase
              .from('events')
              .select(`
                *,
                event_meta (key, value)
              `)
              .order('start_ts_utc', { ascending: true })
              .range(offset, offset + limit - 1);

            if (category) query = query.eq('category', category);
            if (impact) query = query.eq('impact', impact);
            if (country) query = query.eq('country', country);

            const { data: events, error } = await query;
            if (error) throw error;

            return new Response(JSON.stringify({
              events,
              pagination: {
                limit,
                offset,
                total: events?.length || 0
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          break;

        case 'POST':
          const eventData = await req.json();
          
          // Validate required fields
          if (!eventData.title || !eventData.start_ts_utc) {
            return new Response(
              JSON.stringify({ error: 'Title and start_ts_utc are required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Generate slug
          const baseSlug = eventData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          const dateStr = new Date(eventData.start_ts_utc).toISOString().split('T')[0];
          let slug = `${baseSlug}-${dateStr}`;

          // Ensure unique slug
          let counter = 2;
          while (true) {
            const { data: existing } = await supabase
              .from('events')
              .select('id')
              .eq('slug', slug)
              .single();

            if (!existing) break;
            slug = `${baseSlug}-${dateStr}-${counter}`;
            counter++;
          }

          // Create event
          const { data: newEvent, error } = await supabase
            .from('events')
            .insert([{ ...eventData, slug }])
            .select()
            .single();

          if (error) throw error;

          // Add metadata if provided
          if (eventData.meta && Object.keys(eventData.meta).length > 0) {
            const metaEntries = Object.entries(eventData.meta).map(([key, value]) => ({
              event_id: newEvent.id,
              key,
              value: String(value)
            }));

            await supabase.from('event_meta').insert(metaEntries);
          }

          return new Response(JSON.stringify(newEvent), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        case 'PUT':
          if (!eventId) {
            return new Response(
              JSON.stringify({ error: 'Event ID is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const updateData = await req.json();
          const { data: updatedEvent, error: updateError } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .select()
            .single();

          if (updateError) throw updateError;

          return new Response(JSON.stringify(updatedEvent), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        case 'DELETE':
          if (!eventId) {
            return new Response(
              JSON.stringify({ error: 'Event ID is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

          if (deleteError) throw deleteError;

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        default:
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { 
              status: 405,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }
    }

    // Subscriptions endpoints
    if (path.startsWith('/events-management/subscriptions')) {
      const userId = url.searchParams.get('user_id');
      
      switch (method) {
        case 'GET':
          if (!userId) {
            return new Response(
              JSON.stringify({ error: 'user_id is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { data: subscriptions, error } = await supabase
            .from('event_subscriptions')
            .select(`
              *,
              event:events (
                id,
                title,
                start_ts_utc,
                category,
                impact,
                slug
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(subscriptions), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        case 'POST':
          const subscriptionData = await req.json();
          
          if (!subscriptionData.user_id || !subscriptionData.event_id) {
            return new Response(
              JSON.stringify({ error: 'user_id and event_id are required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { data: newSubscription, error: subError } = await supabase
            .from('event_subscriptions')
            .insert([{
              ...subscriptionData,
              channels: subscriptionData.channels || ['email'],
              lead_times: subscriptionData.lead_times || [1440, 60, 10] // 1 day, 1 hour, 10 minutes
            }])
            .select()
            .single();

          if (subError) throw subError;

          return new Response(JSON.stringify(newSubscription), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        case 'DELETE':
          const subscriptionId = url.searchParams.get('subscription_id');
          
          if (!subscriptionId) {
            return new Response(
              JSON.stringify({ error: 'subscription_id is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { error: delError } = await supabase
            .from('event_subscriptions')
            .delete()
            .eq('id', subscriptionId);

          if (delError) throw delError;

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;
      }
    }

    // Follow filters endpoints
    if (path.startsWith('/events-management/follows')) {
      const userId = url.searchParams.get('user_id');
      
      switch (method) {
        case 'GET':
          if (!userId) {
            return new Response(
              JSON.stringify({ error: 'user_id is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { data: follows, error } = await supabase
            .from('follows')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(follows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;

        case 'POST':
          const followData = await req.json();
          
          if (!followData.user_id) {
            return new Response(
              JSON.stringify({ error: 'user_id is required' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { data: newFollow, error: followError } = await supabase
            .from('follows')
            .insert([followData])
            .select()
            .single();

          if (followError) throw followError;

          return new Response(JSON.stringify(newFollow), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          break;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Events API] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})