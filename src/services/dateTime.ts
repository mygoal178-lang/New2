/**
 * ORDERFLOW - International Date, Time & Timezone Service
 * Formats timestamps using IANA timezone identifiers, 12h/24h clocks, and configurable date formats.
 */

import { DateFormat, ClockFormat } from '../types';

export interface TimezoneOption {
  identifier: string;
  label: string;
  offset: string;
  region: string;
}

export const IANA_TIMEZONES: TimezoneOption[] = [
  // Americas
  { identifier: 'America/New_York', label: 'New York (Eastern Time - US)', offset: 'UTC-5', region: 'Americas' },
  { identifier: 'America/Chicago', label: 'Chicago (Central Time - US)', offset: 'UTC-6', region: 'Americas' },
  { identifier: 'America/Denver', label: 'Denver (Mountain Time - US)', offset: 'UTC-7', region: 'Americas' },
  { identifier: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time - US)', offset: 'UTC-8', region: 'Americas' },
  { identifier: 'America/Toronto', label: 'Toronto (Canada)', offset: 'UTC-5', region: 'Americas' },
  { identifier: 'America/Vancouver', label: 'Vancouver (Canada)', offset: 'UTC-8', region: 'Americas' },
  { identifier: 'America/Sao_Paulo', label: 'São Paulo (Brazil)', offset: 'UTC-3', region: 'Americas' },
  { identifier: 'America/Mexico_City', label: 'Mexico City (Mexico)', offset: 'UTC-6', region: 'Americas' },

  // Europe
  { identifier: 'Europe/London', label: 'London (United Kingdom - GMT/BST)', offset: 'UTC+0', region: 'Europe' },
  { identifier: 'Europe/Berlin', label: 'Berlin / Frankfurt (Germany - CET)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Paris', label: 'Paris (France - CET)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Amsterdam', label: 'Amsterdam (Netherlands)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Madrid', label: 'Madrid (Spain)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Rome', label: 'Rome (Italy)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Stockholm', label: 'Stockholm (Sweden)', offset: 'UTC+1', region: 'Europe' },
  { identifier: 'Europe/Zurich', label: 'Zurich (Switzerland)', offset: 'UTC+1', region: 'Europe' },

  // Middle East & Africa
  { identifier: 'Asia/Dubai', label: 'Dubai / Abu Dhabi (UAE - GST)', offset: 'UTC+4', region: 'Middle East' },
  { identifier: 'Asia/Riyadh', label: 'Riyadh (Saudi Arabia - AST)', offset: 'UTC+3', region: 'Middle East' },

  // Asia Pacific
  { identifier: 'Asia/Tokyo', label: 'Tokyo (Japan - JST)', offset: 'UTC+9', region: 'Asia Pacific' },
  { identifier: 'Asia/Seoul', label: 'Seoul (South Korea - KST)', offset: 'UTC+9', region: 'Asia Pacific' },
  { identifier: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8', region: 'Asia Pacific' },
  { identifier: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (Malaysia)', offset: 'UTC+8', region: 'Asia Pacific' },
  { identifier: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8', region: 'Asia Pacific' },
  { identifier: 'Asia/Kolkata', label: 'Kolkata / Mumbai (India - IST)', offset: 'UTC+5:30', region: 'Asia Pacific' },
  { identifier: 'Asia/Dhaka', label: 'Dhaka (Bangladesh - BST)', offset: 'UTC+6', region: 'Asia Pacific' },
  { identifier: 'Australia/Sydney', label: 'Sydney / Melbourne (Australia - AEST)', offset: 'UTC+10', region: 'Asia Pacific' },
  { identifier: 'Australia/Perth', label: 'Perth (Western Australia)', offset: 'UTC+8', region: 'Asia Pacific' },

  // UTC Standard
  { identifier: 'UTC', label: 'UTC (Universal Coordinated Time)', offset: 'UTC+0', region: 'Standard' }
];

export const COMMON_TIMEZONES = IANA_TIMEZONES.map(tz => ({
  zone: tz.identifier,
  label: tz.label,
  offset: tz.offset
}));

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

/**
 * Format date part only
 */
export function formatLocalizedDate(
  isoDateString: string,
  dateFormat: DateFormat = 'YYYY-MM-DD',
  timezone: string = 'UTC'
): string {
  return formatLocalizedDateTime(isoDateString, {
    dateFormat,
    timezone,
    includeTime: false
  });
}

/**
 * Format a UTC ISO timestamp into the business's timezone, format, and clock convention
 */
export function formatLocalizedDateTime(
  isoDateString: string,
  options: {
    timezone?: string;
    dateFormat?: DateFormat;
    clockFormat?: ClockFormat;
    includeTime?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    timezone = 'UTC',
    dateFormat = 'YYYY-MM-DD',
    clockFormat = '24h',
    includeTime = true,
    locale = 'en-US'
  } = options;

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;

    // Build Intl formatter
    const is12Hour = clockFormat === '12h';

    // Format parts
    const dtf = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      hour12: is12Hour
    });

    const parts = dtf.formatToParts(date);
    let year = '';
    let month = '';
    let day = '';
    let hour = '';
    let minute = '';
    let dayPeriod = '';

    parts.forEach(p => {
      if (p.type === 'year') year = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'day') day = p.value;
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    });

    let dateStr = `${year}-${month}-${day}`;
    if (dateFormat === 'DD/MM/YYYY') {
      dateStr = `${day}/${month}/${year}`;
    } else if (dateFormat === 'MM/DD/YYYY') {
      dateStr = `${month}/${day}/${year}`;
    }

    if (!includeTime) return dateStr;

    const timeStr = is12Hour ? `${hour}:${minute} ${dayPeriod}` : `${hour}:${minute}`;
    return `${dateStr} · ${timeStr}`;
  } catch (err) {
    return isoDateString;
  }
}
