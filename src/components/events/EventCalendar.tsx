import React, { useEffect, useState } from 'react';

interface EventCalendarProps {
  symbols?: string[];
}

export function EventCalendar({ symbols }: EventCalendarProps) {
  const [events, setEvents] = useState<any[]>(([]));
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching events data
  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        const mockEvents = [
          { title: 'CPI Report', description: 'Consumer Price Index release', impact: 'high', startTsUtc: Date.now() + 3600000, country: 'US' },
          { title: 'FOMC Meeting', description: 'Federal Open Market Committee meeting', impact: 'critical', startTsUtc: Date.now() + 7200000, country: 'US' },
          { title: 'GDP Data', description: 'Gross Domestic Product release', impact: 'medium', startTsUtc: Date.now() + 10800000, country: 'US' },
        ];
        setEvents(mockEvents);
        setIsLoading(false);
      }
    }, 1000);
    
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="event-calendar">
      <h3>Economic Calendar</h3>
      {events.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        <div className="event-list">
          {events.map((event: any, index) => (
            <div key={index} className="event-item">
              <div className="event-title">{event.title}</div>
              <div className="event-time">{new Date(event.startTsUtc).toLocaleString()}</div>
              <div className={`event-impact impact-${event.impact}`}>{event.impact}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}