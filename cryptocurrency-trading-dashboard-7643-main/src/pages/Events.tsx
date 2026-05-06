import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/EventCard";
import { EventFilters, type EventFilters as EventFiltersType } from "@/components/EventFilters";
import MobileNavigation from "@/components/MobileNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, TrendingUp, Bell, Download, ExternalLink, CalendarDays, List, Grid3X3, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import EventsCalendarView from "@/components/EventsCalendarView";
import EventNotificationSystem from "@/components/EventNotificationSystem";
import EventChecklist from "@/components/EventChecklist";
import EventManagement from "@/components/EventManagement";
import { generateEventICS } from "@/lib/eventUtils";

interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  symbols: string[];
  coins: string[];
  country: string;
  location: string;
  start_ts_utc: string;
  end_ts_utc: string;
  impact: string;
  status: string;
  source_url: string;
  created_at: string;
}

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<EventFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [mainView, setMainView] = useState<'list' | 'calendar' | 'notifications' | 'checklist' | 'management'>('list');
  const [realTimeConnected, setRealTimeConnected] = useState(false);

  useEffect(() => {
    fetchEvents();
    
    // Set up real-time subscription for events with enhanced notifications
    const eventsChannel = supabase
      .channel('events-real-time')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Events updated:', payload);
          setRealTimeConnected(true);
          fetchEvents();
          
          // Enhanced real-time notifications
          if (payload.eventType === 'INSERT') {
            const newEvent = payload.new as Event;
            toast({
              title: "🆕 New Event Added",
              description: `${newEvent.title} scheduled for ${new Date(newEvent.start_ts_utc).toLocaleDateString()}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedEvent = payload.new as Event;
            toast({
              title: "📝 Event Updated",
              description: `${updatedEvent.title} has been modified`,
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "🗑️ Event Removed",
              description: "An event has been cancelled or removed",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Events subscription status:', status);
        setRealTimeConnected(status === 'SUBSCRIBED');
      });

    // Enhanced user-specific real-time subscriptions
    const userChannel = user ? supabase
      .channel(`user-events-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User subscriptions updated:', payload);
          if (payload.eventType === 'INSERT') {
            toast({
              title: "🔔 Subscription Added",
              description: "You'll receive notifications for this event",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "🔕 Unsubscribed",
              description: "Event notifications disabled",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User follows updated:', payload);
          if (payload.eventType === 'INSERT') {
            const follow = payload.new;
            let filterType = '';
            if (follow.category) filterType = `category: ${follow.category}`;
            if (follow.symbol) filterType = `symbol: ${follow.symbol}`;
            if (follow.coin) filterType = `coin: ${follow.coin}`;
            if (follow.country) filterType = `country: ${follow.country}`;
            
            toast({
              title: "👀 Follow Filter Added",
              description: `You'll receive notifications for ${filterType}`,
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "🚫 Follow Filter Removed",
              description: "Filter notifications disabled",
            });
          }
        }
      )
      .subscribe() : null;

    return () => {
      supabase.removeChannel(eventsChannel);
      if (userChannel) {
        supabase.removeChannel(userChannel);
      }
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, activeFilters, activeTab]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_ts_utc', { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
    const now = new Date();

    // Filter by tab (upcoming vs past)
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_ts_utc) > now);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => new Date(event.start_ts_utc) <= now);
    }

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.symbols.some(symbol => symbol.toLowerCase().includes(searchTerm)) ||
        event.coins.some(coin => coin.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (activeFilters.category) {
      filtered = filtered.filter(event => event.category === activeFilters.category);
    }

    // Apply impact filter
    if (activeFilters.impact) {
      filtered = filtered.filter(event => event.impact === activeFilters.impact);
    }

    // Apply country filter
    if (activeFilters.country) {
      filtered = filtered.filter(event => event.country === activeFilters.country);
    }

    setFilteredEvents(filtered);
  };

  const exportToCalendar = () => {
    // Generate ICS file for calendar export
    const icsContent = generateICS(filteredEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-events.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateICS = (events: Event[]) => {
    const calendarLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Financial Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(event => {
      const icsContent = generateEventICS(event);
      const eventLines = icsContent.split('\r\n').slice(5, -1); // Extract just the VEVENT part
      calendarLines.push(...eventLines);
    });

    calendarLines.push('END:VCALENDAR');
    return calendarLines.join('\r\n');
  };

  const getEventStats = () => {
    const upcoming = events.filter(e => new Date(e.start_ts_utc) > new Date()).length;
    const highImpact = events.filter(e => e.impact === 'high').length;
    const cryptoEvents = events.filter(e => e.category === 'crypto').length;
    const macroEvents = events.filter(e => e.category === 'macro').length;

    return { upcoming, highImpact, cryptoEvents, macroEvents };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <MobileNavigation />
        <div className="p-4 md:p-8 pt-20 lg:pt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileNavigation />
      
      <div className="p-4 md:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Financial Events Calendar</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Stay ahead of market-moving events. Track FOMC decisions, economic releases, 
            cryptocurrency developments, and earnings announcements that impact global markets.
          </p>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.upcoming}</div>
                <div className="text-sm text-muted-foreground">Upcoming Events</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.highImpact}</div>
                <div className="text-sm text-muted-foreground">High Impact</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{stats.cryptoEvents}</div>
                <div className="text-sm text-muted-foreground">Crypto Events</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.macroEvents}</div>
                <div className="text-sm text-muted-foreground">Macro Events</div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Status */}
          <div className="flex justify-center mt-4">
            <Badge 
              variant={realTimeConnected ? "default" : "secondary"} 
              className={`animate-pulse ${realTimeConnected ? 'bg-success text-success-foreground' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${realTimeConnected ? 'bg-success-foreground animate-pulse' : 'bg-muted-foreground'}`} />
              {realTimeConnected ? 'Real-time Connected' : 'Connecting...'}
            </Badge>
          </div>
        </header>

        {/* Filters */}
        <EventFilters 
          onFiltersChange={setActiveFilters}
          activeFilters={activeFilters}
        />

        {/* Main View Controls */}
        <div className="flex items-center justify-between my-6">
          <Tabs value={mainView} onValueChange={(value) => setMainView(value as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Implementation
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Management
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCalendar}>
              <Download className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
          </div>
        </div>

        {/* List View Controls */}
        {mainView === 'list' && (
          <div className="flex items-center justify-between my-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Past Events
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  All Events
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {mainView === 'list' && (
          <>
            {filteredEvents.length === 0 ? (
              <Card className="glass-card text-center p-8">
                <CardContent>
                  <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No Events Found</CardTitle>
                  <CardDescription>
                    Try adjusting your filters to find more events.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}

        {mainView === 'calendar' && <EventsCalendarView />}
        
        {mainView === 'notifications' && <EventNotificationSystem />}
        
        {mainView === 'checklist' && <EventChecklist />}

        {mainView === 'management' && <EventManagement onEventsUpdated={fetchEvents} />}

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Event Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Get notified before important market events. Choose your preferred notification timing 
                and channels to never miss a market-moving announcement.
              </CardDescription>
              {!user && (
                <Button onClick={() => window.location.href = '/auth'}>
                  Sign Up for Notifications
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Impact Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Learn how different events affect markets and how to position your portfolio 
                ahead of major announcements.
              </CardDescription>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Events;