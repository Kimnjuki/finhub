import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Upload, 
  Database, 
  Zap,
  Calendar,
  Settings,
  RefreshCw,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventManagementProps {
  onEventsUpdated?: () => void;
}

const EventManagement = ({ onEventsUpdated }: EventManagementProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'other' as 'macro' | 'crypto' | 'earnings' | 'other',
    impact: 'medium' as 'low' | 'medium' | 'high',
    start_ts_utc: '',
    country: '',
    symbols: '',
    coins: ''
  });

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.start_ts_utc) {
      toast({
        title: "Missing Information",
        description: "Title and start date are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate slug for the event
      const baseSlug = newEvent.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const dateStr = new Date(newEvent.start_ts_utc).toISOString().split('T')[0];
      const slug = `${baseSlug}-${dateStr}`;

      const eventData = {
        ...newEvent,
        slug,
        symbols: newEvent.symbols ? newEvent.symbols.split(',').map(s => s.trim()) : [],
        coins: newEvent.coins ? newEvent.coins.split(',').map(c => c.trim()) : [],
        start_ts_utc: new Date(newEvent.start_ts_utc).toISOString()
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) throw error;

      toast({
        title: "Event Created",
        description: `${newEvent.title} has been scheduled`,
      });

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        category: 'other',
        impact: 'medium',
        start_ts_utc: '',
        country: '',
        symbols: '',
        coins: ''
      });

      onEventsUpdated?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ingestFromAdapters = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://psrfbrnxszyxjbhnnivs.supabase.co/functions/v1/event-adapters?action=ingest',
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcmZicm54c3p5eGpiaG5uaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTQxNTIsImV4cCI6MjA3MDIzMDE1Mn0.5XusZqsK3bYF-AsjxRjOqNu7l42S8bp7ud_WIPA55ts`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to ingest events');

      const result = await response.json();
      
      toast({
        title: "Events Ingested",
        description: `Added ${result.summary?.totalInserted || 0} new events from ${result.summary?.adaptersRun || 0} sources`,
      });

      onEventsUpdated?.();
    } catch (error) {
      console.error('Error ingesting events:', error);
      toast({
        title: "Ingestion Error",
        description: "Failed to ingest events from external sources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={ingestFromAdapters}
          disabled={loading}
          className="h-16 flex-col gap-2"
        >
          <Upload className="h-5 w-5" />
          Ingest Events
        </Button>
        <Button
          onClick={() => window.open('/events', '_blank')}
          variant="outline"
          className="h-16 flex-col gap-2"
        >
          <Calendar className="h-5 w-5" />
          View Calendar
        </Button>
        <Button
          onClick={onEventsUpdated}
          variant="outline"
          className="h-16 flex-col gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh Data
        </Button>
      </div>

      {/* Manual Event Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Event
          </CardTitle>
          <CardDescription>
            Manually add a financial event to the calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Federal Reserve Interest Rate Decision"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={newEvent.start_ts_utc}
                onChange={(e) => setNewEvent({ ...newEvent, start_ts_utc: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Event description and impact details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newEvent.category} 
                onValueChange={(value: any) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macro">Macro Economic</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="earnings">Corporate Earnings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="impact">Impact Level</Label>
              <Select 
                value={newEvent.impact} 
                onValueChange={(value: any) => setNewEvent({ ...newEvent, impact: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={newEvent.country}
                onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                placeholder="e.g., US, UK, EU"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbols">Affected Symbols</Label>
              <Input
                id="symbols"
                value={newEvent.symbols}
                onChange={(e) => setNewEvent({ ...newEvent, symbols: e.target.value })}
                placeholder="e.g., EURUSD, GBPUSD (comma-separated)"
              />
            </div>
            <div>
              <Label htmlFor="coins">Affected Cryptocurrencies</Label>
              <Input
                id="coins"
                value={newEvent.coins}
                onChange={(e) => setNewEvent({ ...newEvent, coins: e.target.value })}
                placeholder="e.g., bitcoin, ethereum (comma-separated)"
              />
            </div>
          </div>

          <Button 
            onClick={createEvent} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating Event...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Event Sources Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Event Sources
          </CardTitle>
          <CardDescription>
            Automated event ingestion from external sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-success" />
                <div>
                  <div className="font-semibold">FXEmpire Economic Calendar</div>
                  <div className="text-sm text-muted-foreground">Macro economic events and data releases</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-success" />
                <div>
                  <div className="font-semibold">CoinGecko Events</div>
                  <div className="text-sm text-muted-foreground">Cryptocurrency events and upgrades</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded">
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> Event adapters automatically check for new events every 30 minutes. 
              Manual ingestion can be triggered using the "Ingest Events" button above.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventManagement;