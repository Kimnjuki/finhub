import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellRing, 
  Mail, 
  Smartphone, 
  Globe, 
  Settings,
  Plus,
  Trash2,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreference {
  id: string;
  user_id: string;
  category?: string;
  symbol?: string;
  coin?: string;
  country?: string;
  impact?: string;
  created_at: string;
}

interface EventSubscription {
  id: string;
  event_id: string;
  channels: string[];
  lead_times: number[];
  event: {
    title: string;
    start_ts_utc: string;
    category: string;
    impact: string;
  };
}

const EventNotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Notification settings
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [userTimezone, setUserTimezone] = useState('Africa/Nairobi');

  useEffect(() => {
    if (user) {
      fetchNotificationData();
    }
  }, [user]);

  const fetchNotificationData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('follows')
        .select('*')
        .eq('user_id', user.id);

      if (prefsError) throw prefsError;
      
      // Fetch event subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('event_subscriptions')
        .select(`
          *,
          event:events (
            title,
            start_ts_utc,
            category,
            impact
          )
        `)
        .eq('user_id', user.id);

      if (subsError) throw subsError;

      setPreferences(prefsData || []);
      setSubscriptions(subsData || []);

    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFollowFilter = async (type: 'category' | 'symbol' | 'coin' | 'country', value: string) => {
    if (!user) return;

    const followData: any = {
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    followData[type] = value;

    const { error } = await supabase
      .from('follows')
      .insert([followData]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Follow Added",
        description: `You'll now receive notifications for ${type}: ${value}`,
      });
      fetchNotificationData();
    }
  };

  const removeFollow = async (id: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Follow Removed",
        description: "Follow filter has been removed",
      });
      fetchNotificationData();
    }
  };

  const unsubscribeFromEvent = async (subscriptionId: string) => {
    const { error } = await supabase
      .from('event_subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Unsubscribed",
        description: "You've been unsubscribed from this event",
      });
      fetchNotificationData();
    }
  };

  const formatLeadTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'browser': return <Globe className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Sign In Required</CardTitle>
          <CardDescription>
            Please sign in to manage your notification preferences.
          </CardDescription>
          <Button onClick={() => window.location.href = '/auth'} className="mt-4">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage how and when you receive event notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Controls */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Enable Notifications</div>
              <div className="text-sm text-muted-foreground">
                Turn off to stop all event notifications
              </div>
            </div>
            <Switch
              checked={globalEnabled}
              onCheckedChange={setGlobalEnabled}
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Quiet Hours</div>
                <div className="text-sm text-muted-foreground">
                  Don't send notifications during these hours
                </div>
              </div>
              <Switch
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>
            
            {quietHoursEnabled && (
              <div className="grid grid-cols-3 gap-4 ml-4">
                <Select value={quietStart} onValueChange={setQuietStart}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={quietEnd} onValueChange={setQuietEnd}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userTimezone} onValueChange={setUserTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscriptions">Event Subscriptions</TabsTrigger>
          <TabsTrigger value="filters">Follow Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Active Event Subscriptions
              </CardTitle>
              <CardDescription>
                Events you're subscribed to receive notifications for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active subscriptions</p>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to events from the Events page to get notified
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div 
                      key={subscription.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{subscription.event.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {new Date(subscription.event.start_ts_utc).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{subscription.event.category}</Badge>
                          <Badge variant={subscription.event.impact === 'high' ? 'destructive' : 'secondary'}>
                            {subscription.event.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {subscription.lead_times.map(formatLeadTime).join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {subscription.channels.map(channel => (
                              <div key={channel} className="flex items-center gap-1">
                                {getChannelIcon(channel)}
                                <span className="text-xs capitalize">{channel}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unsubscribeFromEvent(subscription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Follow Filters
              </CardTitle>
              <CardDescription>
                Get notified for all events matching these criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFollowFilter('category', 'macro')}
                >
                  Follow Macro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFollowFilter('category', 'crypto')}
                >
                  Follow Crypto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFollowFilter('category', 'macro')}
                >
                  Follow All Macro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFollowFilter('country', 'US')}
                >
                  Follow US Events
                </Button>
              </div>

              {/* Active Filters */}
              {preferences.length === 0 ? (
                <div className="text-center py-8">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No follow filters active</p>
                  <p className="text-sm text-muted-foreground">
                    Add filters to automatically receive notifications for matching events
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {preferences.map((pref) => (
                    <div 
                      key={pref.id} 
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {pref.category && `Category: ${pref.category}`}
                          {pref.symbol && `Symbol: ${pref.symbol}`}
                          {pref.coin && `Coin: ${pref.coin}`}
                          {pref.country && `Country: ${pref.country}`}
                          {pref.impact && `Impact: ${pref.impact}`}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFollow(pref.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventNotificationSystem;