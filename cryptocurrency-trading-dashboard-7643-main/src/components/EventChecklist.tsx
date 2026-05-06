import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Database, 
  Bell,
  Calendar,
  Globe,
  Settings,
  Search,
  TrendingUp,
  Zap
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'in-progress' | 'pending';
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

const EventChecklist = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'database-schema',
      title: 'Database Schema & Tables',
      description: 'Events, event_meta, event_sources, subscriptions, and follows tables with RLS policies',
      status: 'complete',
      icon: <Database className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'slug-generation',
      title: 'Slug Generation System',
      description: 'Auto-generate unique slugs from title + date with collision handling',
      status: 'complete',
      icon: <Settings className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'event-meta',
      title: 'Event Meta System',
      description: 'Flexible metadata system with suggested keys for macro, crypto, earnings events',
      status: 'complete',
      icon: <Search className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: 'ics-generation',
      title: 'Enhanced ICS Generation',
      description: 'RFC-compliant calendar export with proper timezone handling and metadata',
      status: 'complete',
      icon: <Calendar className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'event-detail-pages',
      title: 'Event Detail Pages',
      description: 'Individual event pages with SEO optimization and structured data',
      status: 'complete',
      icon: <Globe className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'calendar-views',
      title: 'Calendar Views',
      description: 'Month, week, and agenda views with proper event display',
      status: 'complete',
      icon: <Calendar className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'notification-system',
      title: 'Notification System',
      description: 'Event subscriptions, follow filters, and notification preferences',
      status: 'complete',
      icon: <Bell className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'real-time-updates',
      title: 'Real-time Updates',
      description: 'Live event updates using Supabase realtime subscriptions',
      status: 'complete',
      icon: <Zap className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: 'filtering-search',
      title: 'Advanced Filtering & Search',
      description: 'Category, impact, country, symbol, and text-based search filters',
      status: 'complete',
      icon: <Search className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'event-adapters',
      title: 'Event Ingestion Adapters',
      description: 'Pluggable adapters for different event sources with change detection',
      status: 'complete',
      icon: <Database className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: 'api-endpoints',
      title: 'REST API Endpoints',
      description: 'RESTful API for event management, subscriptions, and follows',
      status: 'complete',
      icon: <Globe className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: 'real-time-rates',
      title: 'Real-time Currency Rates',
      description: 'Live currency exchange rates with caching and fallback',
      status: 'complete',
      icon: <TrendingUp className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: 'seo-optimization',
      title: 'SEO & Rich Results',
      description: 'Structured data, meta tags, and search engine optimization',
      status: 'complete',
      icon: <TrendingUp className="h-4 w-4" />,
      priority: 'medium'
    }
  ]);

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
    }
  };

  const completedItems = checklistItems.filter(item => item.status === 'complete').length;
  const inProgressItems = checklistItems.filter(item => item.status === 'in-progress').length;
  const totalItems = checklistItems.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Events System Implementation Progress</CardTitle>
          <CardDescription>
            Comprehensive events system with all recommended features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Progress: {completedItems}/{totalItems} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">{completedItems}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{inProgressItems}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {totalItems - completedItems - inProgressItems}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklistItems.map((item) => (
          <Card 
            key={item.id} 
            className={`glass-card border-l-4 ${getPriorityColor(item.priority)} transition-all hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(item.status)} variant="secondary">
                    {item.status.replace('-', ' ')}
                  </Badge>
                  {getStatusIcon(item.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm leading-relaxed">
                {item.description}
              </CardDescription>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {item.priority} priority
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Implementation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <strong>Core System:</strong> Complete database schema with events, meta, sources, and subscription tables
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <strong>User Interface:</strong> Modern React components with calendar views, filtering, and real-time updates
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <strong>Notifications:</strong> Comprehensive subscription system with multi-channel notifications
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <strong>Calendar Integration:</strong> RFC-compliant ICS generation with proper timezone handling
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <strong>Data Ingestion:</strong> Event adapter framework ready for external source integration
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventChecklist;