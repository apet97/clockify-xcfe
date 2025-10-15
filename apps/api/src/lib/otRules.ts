import { ClockifyTimeEntry } from '../types/clockify.js';
import { ClockifyClient } from './clockifyClient.js';
import { logger } from './logger.js';
import {
  applyOffsetMinutes,
  getDurationHours,
  getTimezoneOffsetMinutes,
  parseDurationHours,
  stripTimeToUtcDate,
  toDate
} from './timeUtils.js';

export const SHORT_REST_THRESHOLD_HOURS = 8;
const REPORT_LOOKBACK_HOURS = 12;

export type OtFlag = 'REG' | 'OT' | 'DT';

export interface OtReferenceEntry {
  id: string;
  userId: string;
  start: Date | null;
  end: Date | null;
  durationHours: number;
}

export interface OtSummary {
  multiplier: number;
  baseMultiplier: number;
  flag: OtFlag;
  dailyHours: number;
  entryHours: number;
  restGapHours: number | null;
  shortRest: boolean;
  previousEntryId?: string;
  timezoneOffsetMinutes: number;
  dayKey: string;
  dayStartUtc: string;
  dayEndUtc: string;
}

export interface DetailedReportEntry {
  id: string;
  userId?: string;
  timeInterval?: {
    start?: string | null;
    end?: string | null;
    duration?: string | number | null;
  };
  duration?: number | null;
  [key: string]: unknown;
}

export interface ComputeOtSummaryInput {
  workspaceId: string;
  timeEntry: ClockifyTimeEntry;
  client?: ClockifyClient;
  correlationId?: string;
  reportEntries?: DetailedReportEntry[];
  previousEntry?: OtReferenceEntry | null;
  baseUrlOverride?: string;
}

const round = (value: number, decimals = 4): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const createDefaultSummary = (timeEntry: ClockifyTimeEntry): OtSummary => {
  const entryHours = round(getDurationHours(timeEntry));
  const startIso = timeEntry.timeInterval?.start ?? new Date().toISOString();
  const offsetMinutes = getTimezoneOffsetMinutes(startIso);
  const startDate = toDate(startIso) ?? new Date();
  const localStart = applyOffsetMinutes(startDate, offsetMinutes);
  const dayStartLocal = stripTimeToUtcDate(localStart);
  const dayEndLocal = new Date(dayStartLocal.getTime() + 24 * 60 * 60 * 1000);
  const dayStartUtc = new Date(dayStartLocal.getTime() - offsetMinutes * 60 * 1000);
  const dayEndUtc = new Date(dayEndLocal.getTime() - offsetMinutes * 60 * 1000);
  const dayKey = buildDayKey(localStart, offsetMinutes);

  return {
    multiplier: 1,
    baseMultiplier: 1,
    flag: 'REG',
    dailyHours: entryHours,
    entryHours,
    restGapHours: null,
    shortRest: false,
    timezoneOffsetMinutes: offsetMinutes,
    dayKey,
    dayStartUtc: dayStartUtc.toISOString(),
    dayEndUtc: dayEndUtc.toISOString()
  };
};

const buildDayKey = (localDate: Date, offsetMinutes: number): string => {
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMins = String(absOffset % 60).padStart(2, '0');
  return `${year}-${month}-${day}@${sign}${offsetHours}${offsetMins}`;
};

interface SanitizedEntry {
  id: string;
  userId: string;
  start: Date;
  end: Date | null;
  durationHours: number;
}

const sanitizeReportEntry = (entry: DetailedReportEntry): SanitizedEntry | null => {
  if (!entry.id || !entry.userId) return null;
  const start = toDate(entry.timeInterval?.start ?? undefined);
  const end = toDate(entry.timeInterval?.end ?? undefined);
  const durationRaw = entry.timeInterval?.duration ?? entry.duration;
  const durationHours = durationRaw != null
    ? typeof durationRaw === 'number'
      ? durationRaw / 3600
      : parseDurationHours(durationRaw, entry.timeInterval?.start ?? undefined, entry.timeInterval?.end ?? undefined)
    : parseDurationHours(undefined, entry.timeInterval?.start ?? undefined, entry.timeInterval?.end ?? undefined);

  if (!start) {
    return null;
  }

  const computedEnd = end ?? (Number.isFinite(durationHours) ? new Date(start.getTime() + durationHours * 60 * 60 * 1000) : null);

  return {
    id: entry.id,
    userId: entry.userId,
    start,
    end: computedEnd,
    durationHours: Number.isFinite(durationHours) ? durationHours : 0
  };
};

const sanitizeClockifyEntry = (entry: ClockifyTimeEntry): SanitizedEntry | null => {
  const start = toDate(entry.timeInterval?.start ?? undefined);
  if (!start) return null;
  const end = toDate(entry.timeInterval?.end ?? undefined);
  const durationHours = getDurationHours(entry);
  const computedEnd = end ?? new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return {
    id: entry.id,
    userId: entry.userId,
    start,
    end: computedEnd,
    durationHours
  };
};

const toReferenceEntry = (entry: SanitizedEntry | null): OtReferenceEntry | null => {
  if (!entry) return null;
  return {
    id: entry.id,
    userId: entry.userId,
    start: entry.start,
    end: entry.end,
    durationHours: entry.durationHours
  };
};

const SHORT_REST_BUFFER_MS = SHORT_REST_THRESHOLD_HOURS * 60 * 60 * 1000 + 2 * 60 * 60 * 1000; // add buffer

export const computeOtSummary = async (input: ComputeOtSummaryInput): Promise<OtSummary> => {
  const summaryFallback = createDefaultSummary(input.timeEntry);
  const interval = input.timeEntry.timeInterval;
  const startIso = interval?.start;
  const currentStart = toDate(startIso ?? undefined);
  if (!currentStart) {
    return summaryFallback;
  }

  const offsetMinutes = getTimezoneOffsetMinutes(startIso ?? undefined);
  const entryHours = round(getDurationHours(input.timeEntry));
  const localStart = applyOffsetMinutes(currentStart, offsetMinutes);
  const dayStartLocal = stripTimeToUtcDate(localStart);
  const dayEndLocal = new Date(dayStartLocal.getTime() + 24 * 60 * 60 * 1000);
  const dayStartUtc = new Date(dayStartLocal.getTime() - offsetMinutes * 60 * 1000);
  const dayEndUtc = new Date(dayEndLocal.getTime() - offsetMinutes * 60 * 1000);
  const dayKey = buildDayKey(localStart, offsetMinutes);

  let reportEntries = input.reportEntries;

  if (!reportEntries && input.client) {
    const rangeStartUtc = new Date(dayStartUtc.getTime() - Math.max(SHORT_REST_BUFFER_MS, REPORT_LOOKBACK_HOURS * 60 * 60 * 1000));
    try {
      const report = await input.client.getDetailedReport(
        input.workspaceId,
        {
          dateRangeStart: rangeStartUtc.toISOString(),
          dateRangeEnd: dayEndUtc.toISOString(),
          users: { ids: [input.timeEntry.userId] },
          exportType: 'JSON'
        },
        input.correlationId,
        undefined,
        input.baseUrlOverride
      );
      reportEntries = report.timeEntries as DetailedReportEntry[];
    } catch (error) {
      logger.warn({ err: error, entryId: input.timeEntry.id }, 'Failed to load detailed report for OT computation');
      return {
        ...summaryFallback,
        entryHours,
        timezoneOffsetMinutes: offsetMinutes,
        dayKey,
        dayStartUtc: dayStartUtc.toISOString(),
        dayEndUtc: dayEndUtc.toISOString()
      };
    }
  }

  const sanitizedMap = new Map<string, SanitizedEntry>();
  (reportEntries ?? []).forEach(raw => {
    const sanitized = sanitizeReportEntry(raw);
    if (sanitized) {
      const existing = sanitizedMap.get(sanitized.id);
      if (!existing || (sanitized.end && existing.end && sanitized.end > existing.end)) {
        sanitizedMap.set(sanitized.id, sanitized);
      }
    }
  });

  const sanitizedCurrent = sanitizeClockifyEntry(input.timeEntry);
  if (sanitizedCurrent) {
    sanitizedMap.set(sanitizedCurrent.id, sanitizedCurrent);
  }

  const entries = Array.from(sanitizedMap.values()).filter(item => item.userId === input.timeEntry.userId && item.start);

  const entriesSameDay = entries
    .filter(item => buildDayKey(applyOffsetMinutes(item.start, offsetMinutes), offsetMinutes) === dayKey)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const currentStartMs = currentStart.getTime();
  const dailyHours = round(
    entriesSameDay
      .filter(item => item.start.getTime() <= currentStartMs)
      .reduce((sum, item) => sum + item.durationHours, 0)
  );

  let previousEntry: SanitizedEntry | null = null;
  const candidateEntries = entries
    .filter(item => item.id !== sanitizedCurrent?.id && item.end && item.end.getTime() <= currentStartMs)
    .sort((a, b) => (b.end?.getTime() ?? 0) - (a.end?.getTime() ?? 0));

  if (candidateEntries.length > 0) {
    previousEntry = candidateEntries[0];
  }

  const previousFromState = input.previousEntry;
  if (previousFromState && previousFromState.end && previousFromState.end.getTime() <= currentStartMs) {
    if (!previousEntry || (previousEntry.end && previousEntry.end < previousFromState.end)) {
      previousEntry = {
        id: previousFromState.id,
        userId: previousFromState.userId,
        start: previousFromState.start ?? previousFromState.end ?? new Date(previousFromState.durationHours * -60 * 60 * 1000 + currentStartMs),
        end: previousFromState.end,
        durationHours: previousFromState.durationHours
      };
    }
  }

  let restGapHours: number | null = null;
  if (previousEntry?.end) {
    restGapHours = round((currentStartMs - previousEntry.end.getTime()) / (60 * 60 * 1000), 4);
    if (restGapHours < 0) {
      restGapHours = 0;
    }
  }

  const shortRest = restGapHours !== null && restGapHours < SHORT_REST_THRESHOLD_HOURS;

  const baseMultiplier = dailyHours > 14 ? 2 : dailyHours > 10 ? 1.5 : 1;
  let multiplier = baseMultiplier;
  if (shortRest && multiplier < 1.5) {
    multiplier = 1.5;
  }

  const flag: OtFlag = multiplier >= 2 ? 'DT' : multiplier >= 1.5 ? 'OT' : 'REG';

  return {
    multiplier,
    baseMultiplier,
    flag,
    dailyHours,
    entryHours,
    restGapHours: restGapHours === null ? null : round(restGapHours, 3),
    shortRest,
    previousEntryId: previousEntry?.id,
    timezoneOffsetMinutes: offsetMinutes,
    dayKey,
    dayStartUtc: dayStartUtc.toISOString(),
    dayEndUtc: dayEndUtc.toISOString()
  };
};

export const buildReferenceEntry = (timeEntry: ClockifyTimeEntry): OtReferenceEntry | null => {
  return toReferenceEntry(sanitizeClockifyEntry(timeEntry));
};
