import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Bell, 
  Download,
  Share2,
  ArrowLeft,
  Globe,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateEventICS, convertToUserTimezone } from "@/lib/eventUtils";
import MobileNavigation from "@/components/MobileNavigation";

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

const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [eventMeta, setEventMeta] = useState<Record<string, string>>({});
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchEventDetails();
    }
  }, [slug]);

  const fetchEventDetails = async () => {
    try {
      // Fetch main event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch event meta
      const { data: metaData } = await supabase
        .from('event_meta')
        .select('key, value')
        .eq('event_id', eventData.id);

      if (metaData) {
        const metaObj = metaData.reduce((acc, meta) => {
          acc[meta.key] = meta.value;
          return acc;
        }, {} as Record<string, string>);
        setEventMeta(metaObj);
      }

      // Fetch related events
      const { data: relatedData } = await supabase
        .from('events')
        .select('*')
        .eq('category', eventData.category)
        .neq('id', eventData.id)
        .limit(3);

      if (relatedData) {
        setRelatedEvents(relatedData);
      }

      // Check subscription status
      if (user) {
        const { data: subData } = await supabase
          .from('event_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_id', eventData.id)
          .single();

        setIsSubscribed(!!subData);
      }

    } catch (error) {
      console.error('Error fetching event details:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !event) return;

    const { error } = await supabase
      .from('event_subscriptions')
      .insert({
        user_id: user.id,
        event_id: event.id,
        channels: ['email', 'push'],
        lead_times: [1440, 60, 10] // 1 day, 1 hour, 10 minutes
      });

    if (error) {
      toast({
        title: "Subscription Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsSubscribed(true);
      toast({
        title: "Subscribed Successfully",
        description: "You'll receive notifications for this event.",
      });
    }
  };

  const handleDownloadICS = () => {
    if (!event) return;
    
    const icsContent = generateEventICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.slug}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard",
      });
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'macro': return '🏦';
      case 'crypto': return '₿';
      case 'earnings': return '📊';
      default: return '📅';
    }
  };

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

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <MobileNavigation />
        <div className="p-4 md:p-8 pt-20 lg:pt-8 max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Event Not Found</CardTitle>
              <CardDescription>
                The event you're looking for doesn't exist or has been removed.
              </CardDescription>
              <Button onClick={() => navigate('/events')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const eventDateTime = new Date(event.start_ts_utc);
  const userDateTime = convertToUserTimezone(event.start_ts_utc, 'Africa/Nairobi');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileNavigation />
      
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": event.title,
          "startDate": event.start_ts_utc,
          "endDate": event.end_ts_utc,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
          "location": {
            "@type": "VirtualLocation",
            "url": window.location.href
          },
          "description": event.description,
          "organizer": {
            "@type": "Organization",
            "name": "Financial Events Calendar"
          },
          "url": window.location.href
        })}
      </script>

      <div className="p-4 md:p-8 pt-20 lg:pt-8 max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/events')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Main Event Card */}
        <Card className="glass-card mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getCategoryIcon(event.category)}</div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(event.impact)}>
                      {event.impact.toUpperCase()} Impact
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {event.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadICS}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardTitle className="text-3xl mb-4 leading-tight">
              {event.title}
            </CardTitle>
            
            <CardDescription className="text-lg leading-relaxed">
              {event.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Date & Time</div>
                    <div className="text-sm text-muted-foreground">
                      {userDateTime} (Local)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {eventDateTime.toUTCString()}
                    </div>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Location</div>
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                    </div>
                  </div>
                )}

                {event.country && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Country</div>
                      <div className="text-sm text-muted-foreground">{event.country}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(event.symbols.length > 0 || event.coins.length > 0) && (
                  <div>
                    <div className="font-semibold mb-2">Related Assets</div>
                    <div className="flex flex-wrap gap-2">
                      {event.symbols.map((symbol) => (
                        <Badge key={symbol} variant="secondary">
                          {symbol}
                        </Badge>
                      ))}
                      {event.coins.map((coin) => (
                        <Badge key={coin} variant="secondary" className="bg-accent/10">
                          {coin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(eventMeta).length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Event Metadata</div>
                    <div className="space-y-1 text-sm">
                      {Object.entries(eventMeta).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubscribe}
                disabled={!user || isSubscribed}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isSubscribed ? 'Subscribed' : 'Subscribe for Alerts'}
              </Button>
              
              {event.source_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(event.source_url, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Related Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedEvents.map((relatedEvent) => (
                  <Card 
                    key={relatedEvent.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/events/${relatedEvent.slug}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getImpactColor(relatedEvent.impact)} variant="secondary">
                          {relatedEvent.impact}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm leading-tight">
                        {relatedEvent.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(relatedEvent.start_ts_utc).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;