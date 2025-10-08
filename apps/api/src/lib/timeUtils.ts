import { ClockifyTimeEntry } from '../types/clockify.js';

const DURATION_REGEX = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

export const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const parseDurationHours = (
  duration?: string | null,
  start?: string | null,
  end?: string | null
): number => {
  if (duration) {
    const match = DURATION_REGEX.exec(duration);
    if (match) {
      const hours = Number(match[1] ?? 0);
      const minutes = Number(match[2] ?? 0);
      const seconds = Number(match[3] ?? 0);
      return hours + minutes / 60 + seconds / 3600;
    }
  }

  const startDate = toDate(start);
  const endDate = toDate(end);
  if (startDate && endDate) {
    const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
    return diffMs / (1000 * 60 * 60);
  }
  return 0;
};

export const getDurationHours = (timeEntry: Pick<ClockifyTimeEntry, 'timeInterval'>): number => {
  const interval = timeEntry.timeInterval;
  if (!interval) return 0;
  return parseDurationHours(interval.duration ?? undefined, interval.start ?? undefined, interval.end ?? undefined);
};

export const diffHours = (start: Date, end: Date): number => {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const getTimezoneOffsetMinutes = (isoString?: string | null): number => {
  if (!isoString) return 0;
  const tzMatch = isoString.match(/([+-])(\d{2}):?(\d{2})$/);
  if (!tzMatch) {
    return 0;
  }
  const sign = tzMatch[1] === '-' ? -1 : 1;
  const hours = Number(tzMatch[2]);
  const minutes = Number(tzMatch[3]);
  return sign * (hours * 60 + minutes);
};

export const applyOffsetMinutes = (date: Date, offsetMinutes: number): Date => {
  return new Date(date.getTime() + offsetMinutes * 60 * 1000);
};

export const stripTimeToUtcDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};
