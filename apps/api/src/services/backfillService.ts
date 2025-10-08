import { randomUUID } from 'node:crypto';
import { CONFIG } from '../config/index.js';
import { clockifyClient, RateLimitError } from '../lib/clockifyClient.js';
import { FormulaEngine, type FormulaDefinition } from '../lib/formulaEngine.js';
import { computeOtSummary, buildReferenceEntry, type OtReferenceEntry, type DetailedReportEntry, type OtSummary } from '../lib/otRules.js';
import { toDate } from '../lib/timeUtils.js';
import type { ClockifyTimeEntry } from '../types/clockify.js';
import { fetchFormulaEngineInputs } from './formulaService.js';
import { recordRun } from './runService.js';
import { logger } from '../lib/logger.js';

export type BackfillParams = {
  from: string;
  to: string;
  userId?: string;
  dryRun?: boolean;
};

export type BackfillResult = {
  scanned: number;
  updated: number;
  dryRun: boolean;
  dayResults: Array<{
    date: string;
    entries: number;
    updated: number;
    errors: number;
  }>;
  outcomes: Array<{
    entryId: string;
    updates: number;
    correlationId: string;
    otMultiplier?: number;
    otFlag?: string;
    error?: string;
  }>;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatDateForAPI = (date: Date): string => {
  // Preserve the full timestamp (including end-of-day boundaries) while trimming milliseconds
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const getDaysBetween = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

const validateDateRange = (start: Date, end: Date): void => {
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 366) {
    throw new Error(`Date range too large: ${daysDiff} days. Maximum allowed is 366 days for Clockify Reports API.`);
  }
};

const processEntriesPage = async (
  workspaceId: string,
  engine: FormulaEngine,
  formulas: FormulaDefinition[],
  reportEntries: DetailedReportEntry[],
  dryRun: boolean,
  correlationId: string,
  state: { lastEntryByUser: Map<string, OtReferenceEntry> }
): Promise<{
  processed: number;
  updated: number;
  errors: number;
  outcomes: Array<{ entryId: string; updates: number; correlationId: string; otMultiplier?: number; otFlag?: string; error?: string }>
}> => {
  let processed = 0;
  let updated = 0;
  let errors = 0;
  const outcomes: Array<{ entryId: string; updates: number; correlationId: string; otMultiplier?: number; otFlag?: string; error?: string }> = [];

  const sortedEntries = [...reportEntries].sort((a, b) => {
    const aStart = toDate(a.timeInterval?.start ?? undefined)?.getTime() ?? 0;
    const bStart = toDate(b.timeInterval?.start ?? undefined)?.getTime() ?? 0;
    return aStart - bStart;
  });

  for (const entry of sortedEntries) {
    if (!entry.id) continue;
    const entryCorrelationId = `${correlationId}-${entry.id}`;
    let liveEntry: ClockifyTimeEntry | null = null;
    let otSummary: OtSummary | null = null;

    try {
      liveEntry = await clockifyClient.getTimeEntry(workspaceId, entry.id, entryCorrelationId);
      processed++;

      const previousReference = state.lastEntryByUser.get(liveEntry.userId) ?? null;
      const summary = await computeOtSummary({
        workspaceId,
        timeEntry: liveEntry,
        reportEntries,
        previousEntry: previousReference ?? null
      });
      otSummary = summary;

      const { updates } = engine.evaluate(formulas, { timeEntry: liveEntry, otSummary: summary }, 'TIME_ENTRY_UPDATED');

      if (updates.length === 0) {
        outcomes.push({
          entryId: entry.id,
          updates: 0,
          correlationId: entryCorrelationId,
          otMultiplier: summary.multiplier,
          otFlag: summary.flag
        });
        const reference = buildReferenceEntry(liveEntry);
        if (reference?.end) {
          state.lastEntryByUser.set(liveEntry.userId, reference);
        }
        continue;
      }

      if (!dryRun) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount <= maxRetries) {
          try {
            await clockifyClient.patchTimeEntryCustomFields(
              workspaceId,
              liveEntry.id,
              { customFieldValues: updates.map((item) => ({ customFieldId: item.customFieldId, value: item.value })) },
              { correlationId: entryCorrelationId }
            );

            await recordRun({
              workspaceId,
              entryId: liveEntry.id,
              userId: liveEntry.userId,
              status: 'success',
              ms: 0,
              event: 'BACKFILL_APPLY',
              correlationId: entryCorrelationId,
              diff: { updates, backfill: true, ot: summary }
            });

            break;
          } catch (error) {
            if (error instanceof RateLimitError && retryCount < maxRetries) {
              const delayMs = error.retryAfterMs || 1000;
              logger.warn({
                entryId: entry.id,
                retryAfterMs: delayMs,
                attempt: retryCount + 1
              }, 'Rate limited during backfill patch, retrying');
              await sleep(delayMs);
              retryCount++;
            } else {
              throw error;
            }
          }
        }
      }

      updated++;
      outcomes.push({
        entryId: entry.id,
        updates: updates.length,
        correlationId: entryCorrelationId,
        otMultiplier: summary.multiplier,
        otFlag: summary.flag
      });

      const reference = buildReferenceEntry(liveEntry);
      if (reference?.end) {
        state.lastEntryByUser.set(liveEntry.userId, reference);
      }

    } catch (error) {
      errors++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        err: error,
        entryId: entry.id,
        correlationId: entryCorrelationId
      }, 'Failed to process entry during backfill');

      outcomes.push({
        entryId: entry.id,
        updates: 0,
        correlationId: entryCorrelationId,
        otMultiplier: otSummary?.multiplier ?? undefined,
        otFlag: otSummary?.flag ?? undefined,
        error: errorMessage
      });

      if (!dryRun) {
        try {
          await recordRun({
            workspaceId,
            entryId: entry.id,
            userId: liveEntry?.userId ?? 'unknown',
            status: 'error',
            ms: 0,
            event: 'BACKFILL_APPLY',
            correlationId: entryCorrelationId,
            diff: { error: errorMessage, backfill: true, ot: otSummary ?? undefined }
          });
        } catch (recordError) {
          logger.error({ err: recordError, entryId: entry.id }, 'Failed to record error run');
        }
      }
    }
  }

  return { processed, updated, errors, outcomes };
};

export const runBackfill = async (params: BackfillParams): Promise<BackfillResult> => {
  const correlationId = randomUUID();
  const workspaceId = CONFIG.WORKSPACE_ID;

  logger.info({ 
    params, 
    correlationId,
    workspaceId 
  }, 'Starting backfill operation');

  try {
    // Load formulas and dictionaries
    const { formulas, dictionaries } = await fetchFormulaEngineInputs(workspaceId);
    const engine = new FormulaEngine(dictionaries);

    // Parse date range and split into daily windows
    const startDate = new Date(params.from);
    const endDate = new Date(params.to);
    
    // Validate date range constraints
    validateDateRange(startDate, endDate);
    
    const days = getDaysBetween(startDate, endDate);

    logger.info({ 
      dayCount: days.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString() 
    }, 'Processing backfill by daily windows');

    let totalScanned = 0;
    let totalUpdated = 0;
    const dayResults: BackfillResult['dayResults'] = [];
    const allOutcomes: BackfillResult['outcomes'] = [];
    const state = { lastEntryByUser: new Map<string, OtReferenceEntry>() };

    // Process each day
    for (const day of days) {
      const dayStart = formatDateForAPI(day);
      const dayEnd = formatDateForAPI(new Date(day.getTime() + 24 * 60 * 60 * 1000 - 1));
      
      logger.debug({ date: day.toISOString().split('T')[0], dayStart, dayEnd }, 'Processing day window');

      let dayScanned = 0;
      let dayUpdated = 0;
      let dayErrors = 0;
      let page = 1;
      const pageSize = 200; // Larger page size for efficiency

      // Paginate through all entries for this day
      while (true) {
        let retryCount = 0;
        const maxRetries = 3;
        let report: Awaited<ReturnType<typeof clockifyClient.getDetailedReport>> | undefined;

        // Get page with retry on rate limit
        while (retryCount <= maxRetries) {
          try {
            report = await clockifyClient.getDetailedReport(
              workspaceId,
              {
                dateRangeStart: dayStart,
                dateRangeEnd: dayEnd,
                users: params.userId ? { ids: [params.userId] } : undefined,
                exportType: 'JSON',
                page,
                pageSize
              },
              `${correlationId}-day-${day.toISOString().split('T')[0]}-page-${page}`
            );
            break;
          } catch (error) {
            if (error instanceof RateLimitError && retryCount < maxRetries) {
              const delayMs = error.retryAfterMs || 1000;
              logger.warn({ 
                retryAfterMs: delayMs, 
                attempt: retryCount + 1,
                page,
                date: day.toISOString().split('T')[0]
              }, 'Rate limited during reports API call, retrying');
              await sleep(delayMs);
              retryCount++;
            } else {
              throw error;
            }
          }
        }

        if (!report) {
          throw new Error('Failed to get report after retries');
        }

        const reportEntries = (report.timeEntries ?? []) as DetailedReportEntry[];
        dayScanned += reportEntries.length;

        if (reportEntries.length === 0) {
          break; // No more entries for this day
        }

        const pageResult = await processEntriesPage(
          workspaceId,
          engine,
          formulas,
          reportEntries,
          params.dryRun ?? false,
          `${correlationId}-day-${day.toISOString().split('T')[0]}-page-${page}`,
          state
        );

        dayUpdated += pageResult.updated;
        dayErrors += pageResult.errors;
        allOutcomes.push(...pageResult.outcomes);

        // Check if we've reached the end of results
        if (reportEntries.length < pageSize) {
          break;
        }

        page++;
      }

      totalScanned += dayScanned;
      totalUpdated += dayUpdated;

      dayResults.push({
        date: day.toISOString().split('T')[0],
        entries: dayScanned,
        updated: dayUpdated,
        errors: dayErrors
      });

      logger.info({ 
        date: day.toISOString().split('T')[0],
        scanned: dayScanned,
        updated: dayUpdated,
        errors: dayErrors
      }, 'Completed day window');
    }

    const result: BackfillResult = {
      scanned: totalScanned,
      updated: totalUpdated,
      dryRun: params.dryRun ?? false,
      dayResults,
      outcomes: allOutcomes
    };

    logger.info({ 
      result: {
        scanned: result.scanned,
        updated: result.updated,
        dryRun: result.dryRun,
        days: result.dayResults.length
      },
      correlationId 
    }, 'Backfill operation completed');

    return result;

  } catch (error) {
    logger.error({ err: error, params, correlationId }, 'Backfill operation failed');
    throw error;
  }
};
