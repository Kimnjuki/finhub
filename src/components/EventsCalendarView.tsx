import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  List,
  Grid3X3
} from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { useNavigate } from "react-router-dom";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}

const EventsCalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Calculate date range for Convex query
  const dateRange = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Extend range to show events from previous/next month that appear on calendar
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    
    const endOfCalendar = new Date(endOfMonth);
    endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

    return {
      startTs: startOfCalendar.getTime(),
      endTs: endOfCalendar.getTime(),
    };
  }, [currentDate]);

  // Fetch events from Convex
  const convexEvents = useQuery(api.events.listByDateRange, {
    startTs: dateRange.startTs,
    endTs: dateRange.endTs,
  });

  const loading = convexEvents === undefined;
  const events = convexEvents ?? [];

  // Generate calendar days from Convex events
  const calendarDays = useMemo((): CalendarDay[] => {
    if (!events || events.length === 0) return [];
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    const endOfCalendar = new Date(endOfMonth);
    
    // Start from Sunday
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    // End on Saturday
    endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

    const days: CalendarDay[] = [];
    const currentDateLocal = new Date(startOfCalendar);
    const today = new Date();

    while (currentDateLocal <= endOfCalendar) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTsUtc);
        return eventDate.toDateString() === currentDateLocal.toDateString();
      });

      days.push({
        date: new Date(currentDateLocal),
        isCurrentMonth: currentDateLocal.getMonth() === currentDate.getMonth(),
        isToday: currentDateLocal.toDateString() === today.toDateString(),
        events: dayEvents
      });

      currentDateLocal.setDate(currentDateLocal.getDate() + 1);
    }

    return days;
  }, [events, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startTsUtc);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  };

  const renderMonthView = () => (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{formatDateHeader(currentDate)}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <Card
            key={index}
            className={`min-h-[120px] cursor-pointer transition-all hover:shadow-md ${
              day.isCurrentMonth ? '' : 'opacity-50'
            } ${
              day.isToday ? 'ring-2 ring-primary' : ''
            } ${
              selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-accent' : ''
            }`}
            onClick={() => setSelectedDate(day.date)}
          >
            <CardContent className="p-2">
              <div className="text-sm font-semibold mb-2">
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event._id}
                    className={`text-xs p-1 rounded truncate ${getImpactColor(event.impact)} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.slug}`);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSelectedDateEvents().length === 0 ? (
              <p className="text-muted-foreground">No events scheduled for this date.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSelectedDateEvents().map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWeekView = () => {
    // Get start of week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayEvents = events.filter(event => {
              const eventDate = new Date(event.startTsUtc);
              return eventDate.toDateString() === day.toDateString();
            });

            return (
              <Card key={day.toISOString()} className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">
                    <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-2xl font-bold">{day.getDate()}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event._id}
                        className={`text-xs p-2 rounded cursor-pointer ${getImpactColor(event.impact)} text-white`}
                        onClick={() => navigate(`/events/${event.slug}`)}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="opacity-75">
                          {new Date(event.startTsUtc).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.startTsUtc) > new Date())
      .slice(0, 20);

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming events found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Month
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="month" className="mt-6">
          {renderMonthView()}
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          {renderWeekView()}
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          {renderAgendaView()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsCalendarView;