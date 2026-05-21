import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink, Bell, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Event {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  symbols: string[];
  coins: string[];
  country: string;
  location: string;
  startTsUtc: number;
  endTsUtc: number;
  impact: string;
  status: string;
  sourceUrl: string;
  createdAt: number;
}

interface EventCardProps {
  event: Event;
}

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

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
};

const getCountdownText = (timestamp: number) => {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff < 0) return 'Event passed';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const EventCard = ({ event }: EventCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribeMutation = useMutation(api.eventSubscriptions.subscribe);
  const existingSubscription = useQuery(
    api.eventSubscriptions.checkSubscribed,
    user ? { userId: user.id, eventId: event._id } : "skip"
  );

  const { date, time } = formatDateTime(event.startTsUtc);
  const countdown = getCountdownText(event.startTsUtc);

  // Update subscription state from query result
  useEffect(() => {
    if (existingSubscription !== undefined) {
      setIsSubscribed(existingSubscription);
    }
  }, [existingSubscription]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to events.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await subscribeMutation({
        userId: user.id,
        eventId: event._id,
        channels: ['email'],
        leadTimes: [1440, 60, 10] // 1 day, 1 hour, 10 minutes
      });
      
      setIsSubscribed(true);
      toast({
        title: "Subscribed Successfully",
        description: "You'll receive notifications for this event.",
      });
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <Card className="glass-card group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getCategoryIcon(event.category)}</div>
            <div>
              <Badge className={getImpactColor(event.impact)} variant="secondary">
                {event.impact.toUpperCase()} Impact
              </Badge>
              <Badge variant="outline" className="ml-2 capitalize">
                {event.category}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-primary">{countdown}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
        </div>
        
        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 leading-tight mt-2">
          {event.title}
        </CardTitle>
        
        <CardDescription className="text-sm leading-relaxed">
          {event.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {date}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {time} UTC
          </div>
          {event.country && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.country}
            </div>
          )}
        </div>

        {(event.symbols.length > 0 || event.coins.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {event.symbols.map((symbol) => (
              <Badge key={symbol} variant="secondary" className="text-xs">
                {symbol}
              </Badge>
            ))}
            {event.coins.map((coin) => (
              <Badge key={coin} variant="secondary" className="text-xs bg-accent/10">
                {coin}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubscribe}
            disabled={loading || isSubscribed}
            className="flex-1"
          >
            <Bell className="h-4 w-4 mr-2" />
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
          
          {event.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(event.sourceUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};