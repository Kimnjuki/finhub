export interface ParsedEvent {
  title: string;
  description?: string;
  category: 'macro' | 'crypto' | 'earnings' | 'other';
  symbols?: string[];
  coins?: string[];
  country?: string;
  start: string | Date;
  end?: string | Date;
  impact?: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'tentative' | 'postponed' | 'canceled' | 'complete';
  sourceUrl: string;
  meta?: Record<string, string>;
}

export interface EventAdapter {
  name: string;
  fetchRaw(): Promise<any>;
  parse(raw: any): ParsedEvent[];
}

export const generateSlug = (title: string, date: Date): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const dateStr = date.toISOString().split('T')[0];
  return `${baseSlug}-${dateStr}`;
};

// Pass a checkSlugExists function from the caller (backed by Convex query)
export const ensureUniqueSlug = async (
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = baseSlug;
  let counter = 2;
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export const META_KEYS = {
  MACRO: { TYPE: 'macro:type' },
  CRYPTO: { NETWORK: 'crypto:network', TRIGGER: 'crypto:trigger' },
  EARNINGS: { TICKER: 'earnings:ticker', FISCAL_Q: 'earnings:fiscal_q' },
  DISPLAY: { ICON: 'display:icon', COLOR: 'display:color' },
  ICS: { UID: 'ics:uid' },
} as const;

export const computeEventChecksum = (event: ParsedEvent): string => {
  const minimalEvent = {
    title: event.title,
    start: event.start,
    category: event.category,
    impact: event.impact,
    status: event.status,
  };
  return btoa(JSON.stringify(minimalEvent));
};

export const projectBitcoinHalving = (currentHeight: number, asOfTs: Date): Date => {
  const TARGET_HALVING_HEIGHT = 1050000;
  const AVERAGE_BLOCK_TIME_SEC = 600;
  const blocksRemaining = TARGET_HALVING_HEIGHT - currentHeight;
  const etaSec = blocksRemaining * AVERAGE_BLOCK_TIME_SEC;
  return new Date(asOfTs.getTime() + etaSec * 1000);
};

// event.startTsUtc is a number (ms); event.endTsUtc is number | undefined
export const generateEventICS = (event: any, userTz = 'Africa/Nairobi'): string => {
  const uid = event.meta?.['ics:uid'] || `${event._id ?? event.id}@financial-events.com`;
  const startDate = new Date(event.startTsUtc ?? event.start_ts_utc);
  const endTsRaw = event.endTsUtc ?? event.end_ts_utc;
  const endDate = endTsRaw ? new Date(endTsRaw) : null;

  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const escapeICS = (text: string) =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  const sourceUrl = event.sourceUrl ?? event.source_url ?? '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Financial Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    ...(endDate ? [`DTEND:${formatICSDate(endDate)}`] : []),
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description || '')}\\nSource: ${sourceUrl}`,
    ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
    `CATEGORIES:${event.category.toUpperCase()}`,
    `X-IMPACT:${event.impact?.toUpperCase() || 'LOW'}`,
    ...(event.symbols?.length > 0 ? [`X-SYMBOLS:${event.symbols.join(',')}`] : []),
    ...(event.coins?.length > 0 ? [`X-COINS:${event.coins.join(',')}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
};

export const validateEvent = (event: ParsedEvent): string[] => {
  const errors: string[] = [];
  if (!event.title || event.title.length > 140) {
    errors.push('Title is required and must be under 140 characters');
  }
  if (!event.sourceUrl) {
    errors.push('Source URL is required');
  }
  if (event.category === 'earnings' && (!event.symbols || event.symbols.length === 0)) {
    errors.push('Earnings events require at least one symbol');
  }
  const startDate = new Date(event.start);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  if (startDate < ninetyDaysAgo && event.status !== 'complete') {
    errors.push('Events older than 90 days must be marked as complete');
  }
  return errors;
};

export const convertToUserTimezone = (utcDate: string | number, timezone: string): string => {
  return new Date(utcDate).toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const filterEvents = (events: any[], filters: any) => {
  return events.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.impact && event.impact !== filters.impact) return false;
    if (filters.country && event.country !== filters.country) return false;
    if (filters.symbols && !filters.symbols.some((s: string) => event.symbols?.includes(s))) return false;
    if (filters.coins && !filters.coins.some((c: string) => event.coins?.includes(c))) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        event.title,
        event.description,
        ...(event.symbols || []),
        ...(event.coins || []),
        event.category,
        event.country,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }
    return true;
  });
};
