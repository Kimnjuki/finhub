import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../providers/MarketDataProvider';

interface EventCalendarProps {
  symbols?: string[];
}

export function EventCalendar({ symbols }: EventCalendarProps) {
  const { streams } = useMarketData();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!streams) return;

    // Filter for economic events
    const filteredEvents = streams.filter(
      (s: any) => s.channel === 'economic_calendar' && symbols?.some(sym => s.instrumentId?.includes(sym))
    );

    setEvents(filteredEvents.slice(0, 5)); // Limit to 5 events
  }, [streams, symbols]);

  return (
    <div className="event-calendar">
      <h3>Economic Calendar</h3>
      <div className="event-list">
        {events.length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          events.map((event: any, index) => (
            <div key={index} className="event-item">
              <div className="event-title">{event.payload?.title || event.payload?.event}</div>
              <div className="event-time">{event.payload?.startTsUtc || 'TBD'}</div>
              <div className="event-impact">{event.payload?.impact || 'Medium'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}