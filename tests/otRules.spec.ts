import { describe, expect, it } from 'vitest';
import type { ClockifyTimeEntry } from '@api/types/clockify.js';
import { computeOtSummary, buildReferenceEntry, type DetailedReportEntry } from '@api/lib/otRules.js';

const makeTimeEntry = (id: string, startIso: string, hours: number, userId = 'user-1'): ClockifyTimeEntry => {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  const durationIso = `PT${hours}H`;

  // Preserve original timezone offset by computing end time with same offset
  let endStr: string;
  if (startIso.includes('+') || (startIso.includes('-') && !startIso.endsWith('Z'))) {
    // Extract timezone offset from start
    const tzMatch = startIso.match(/([+-]\d{2}:\d{2})$/);
    if (tzMatch) {
      const offset = tzMatch[1];
      // Format end time with same offset
      const endUtc = end.toISOString().slice(0, -1); // Remove 'Z'
      endStr = endUtc + offset;
    } else {
      endStr = end.toISOString();
    }
  } else {
    endStr = end.toISOString();
  }

  return {
    id,
    description: null,
    tagIds: [],
    userId,
    billable: true,
    taskId: null,
    projectId: 'proj-1',
    timeInterval: {
      start: startIso,  // Keep original start string unchanged
      end: endStr,
      duration: durationIso
    },
    workspaceId: 'ws-1',
    isLocked: false,
    hourlyRate: null,
    costRate: null,
    customFieldValues: [],
    project: undefined,
    task: undefined,
    user: { id: userId },
    tags: []
  } as ClockifyTimeEntry;
};

const makeReportEntry = (id: string, startIso: string, hours: number, userId = 'user-1'): DetailedReportEntry => {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  const durationIso = `PT${hours}H`;

  // Preserve original timezone offset by computing end time with same offset
  let endStr: string;
  if (startIso.includes('+') || (startIso.includes('-') && !startIso.endsWith('Z'))) {
    // Extract timezone offset from start
    const tzMatch = startIso.match(/([+-]\d{2}:\d{2})$/);
    if (tzMatch) {
      const offset = tzMatch[1];
      // Format end time with same offset
      const endUtc = end.toISOString().slice(0, -1); // Remove 'Z'
      endStr = endUtc + offset;
    } else {
      endStr = end.toISOString();
    }
  } else {
    endStr = end.toISOString();
  }

  return {
    id,
    userId,
    timeInterval: {
      start: startIso,  // Keep original start string unchanged
      end: endStr,
      duration: durationIso
    }
  };
};

describe('computeOtSummary', () => {
  it('returns base multiplier 1.0 for shifts <= 10h', async () => {
    const entry = makeTimeEntry('entry-1', '2024-01-01T08:00:00Z', 8);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: entry,
      reportEntries: [makeReportEntry('entry-1', '2024-01-01T08:00:00Z', 8)]
    });

    expect(summary.multiplier).toBe(1);
    expect(summary.flag).toBe('REG');
    expect(summary.dailyHours).toBeCloseTo(8);
  });

  it('returns 1.5 multiplier when daily hours exceed 10', async () => {
    const first = makeReportEntry('entry-0', '2024-01-01T08:00:00Z', 6);
    const current = makeTimeEntry('entry-1', '2024-01-01T14:30:00Z', 6);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: current,
      reportEntries: [first, makeReportEntry('entry-1', '2024-01-01T14:30:00Z', 6)]
    });

    expect(summary.dailyHours).toBeCloseTo(12);
    expect(summary.multiplier).toBe(1.5);
    expect(summary.flag).toBe('OT');
  });

  it('returns 2.0 multiplier when daily hours exceed 14', async () => {
    const earlier = makeReportEntry('entry-0', '2024-01-01T06:00:00Z', 8);
    const current = makeTimeEntry('entry-1', '2024-01-01T15:00:00Z', 7);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: current,
      reportEntries: [earlier, makeReportEntry('entry-1', '2024-01-01T15:00:00Z', 7)]
    });

    expect(summary.dailyHours).toBeCloseTo(15);
    expect(summary.multiplier).toBe(2);
    expect(summary.flag).toBe('DT');
  });

  it('elevates multiplier when rest gap is under 8 hours', async () => {
    const previousEntry = makeTimeEntry('prev-entry', '2024-01-01T16:00:00Z', 6);
    const current = makeTimeEntry('entry-1', '2024-01-02T00:00:00Z', 4);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: current,
      reportEntries: [
        makeReportEntry('prev-entry', '2024-01-01T16:00:00Z', 6),
        makeReportEntry('entry-1', '2024-01-02T00:00:00Z', 4)
      ],
      previousEntry: buildReferenceEntry(previousEntry)
    });

    expect(summary.restGapHours).toBeLessThan(8);
    expect(summary.multiplier).toBeGreaterThanOrEqual(1.5);
    expect(summary.flag).toBe('OT');
  });

  it('keeps multiplier at 1.0 for exactly 10 hours in a day', async () => {
    // Use a single 10-hour entry to avoid short rest elevation
    const entry = makeTimeEntry('entry-1', '2024-01-01T08:00:00Z', 10);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: entry,
      reportEntries: [makeReportEntry('entry-1', '2024-01-01T08:00:00Z', 10)]
    });

    expect(summary.dailyHours).toBeCloseTo(10);
    expect(summary.multiplier).toBe(1);
    expect(summary.flag).toBe('REG');
  });

  it('treats exactly 14 hours as overtime, not double time', async () => {
    const first = makeReportEntry('entry-0', '2024-01-01T06:00:00Z', 8);
    const second = makeTimeEntry('entry-1', '2024-01-01T14:00:00Z', 6);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: second,
      reportEntries: [first, makeReportEntry('entry-1', '2024-01-01T14:00:00Z', 6)]
    });

    expect(summary.dailyHours).toBeCloseTo(14);
    expect(summary.multiplier).toBe(1.5);
    expect(summary.flag).toBe('OT');
  });

  it('does not escalate when rest gap is exactly 8 hours', async () => {
    const previous = makeTimeEntry('prev-entry', '2024-01-01T12:00:00Z', 8);
    const next = makeTimeEntry('entry-1', '2024-01-02T04:00:00Z', 4);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: next,
      reportEntries: [
        makeReportEntry('prev-entry', '2024-01-01T12:00:00Z', 8),
        makeReportEntry('entry-1', '2024-01-02T04:00:00Z', 4)
      ],
      previousEntry: buildReferenceEntry(previous)
    });

    expect(summary.restGapHours).toBeCloseTo(8, 3);
    expect(summary.shortRest).toBe(false);
    expect(summary.multiplier).toBe(1);
  });

  it('aggregates multi-split day entries in chronological order', async () => {
    const first = makeReportEntry('entry-0', '2024-01-01T05:00:00Z', 3);
    const second = makeReportEntry('entry-1', '2024-01-01T09:30:00Z', 4);
    const thirdEntry = makeTimeEntry('entry-2', '2024-01-01T15:00:00Z', 5);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: thirdEntry,
      reportEntries: [first, second, makeReportEntry('entry-2', '2024-01-01T15:00:00Z', 5)]
    });

    expect(summary.dailyHours).toBeCloseTo(12);
    expect(summary.previousEntryId).toBe('entry-1');
    expect(summary.multiplier).toBe(1.5);
  });

  it('respects timezone offsets when generating day key', async () => {
    const entry = makeTimeEntry('entry-1', '2024-01-01T23:00:00-05:00', 4);
    const summary = await computeOtSummary({
      workspaceId: 'ws-1',
      timeEntry: entry,
      reportEntries: [makeReportEntry('entry-1', '2024-01-01T23:00:00-05:00', 4)]
    });

    expect(summary.dayKey).toContain('@-0500');
    // Day start in UTC for Jan 1 midnight EST (-05:00) is Jan 1 5:00 AM UTC
    expect(summary.dayStartUtc).toBe('2024-01-01T05:00:00.000Z');
  });
});