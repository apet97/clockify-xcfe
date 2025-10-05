import { randomUUID } from 'node:crypto';
import { CONFIG } from '../config/index.js';
import { clockifyClient } from '../lib/clockifyClient.js';
import { FormulaEngine } from '../lib/formulaEngine.js';
import { fetchFormulaEngineInputs } from './formulaService.js';
import { recordRun } from './runService.js';

export type BackfillParams = {
  from: string;
  to: string;
  userId?: string;
  dryRun?: boolean;
};

type ReportsResponse = {
  timeEntries?: { id: string }[];
  totals?: unknown;
};

export const runBackfill = async (params: BackfillParams) => {
  const workspaceId = CONFIG.WORKSPACE_ID;
  const { formulas, dictionaries } = await fetchFormulaEngineInputs(workspaceId);
  const engine = new FormulaEngine(dictionaries);

  const report = await clockifyClient.request<ReportsResponse>({
    method: 'POST',
    path: `/workspaces/${workspaceId}/reports/detailed`,
    body: {
      dateRangeStart: params.from,
      dateRangeEnd: params.to,
      users: params.userId ? { ids: [params.userId] } : undefined,
      exportType: 'JSON',
      hydrate: true,
      page: 1,
      pageSize: 50
    }
  });

  const entries = report.timeEntries ?? [];
  const outcomes: { entryId: string; updates: number; correlationId: string }[] = [];

  for (const entry of entries) {
    const correlationId = randomUUID();
    const liveEntry = await clockifyClient.getTimeEntry(workspaceId, entry.id, correlationId);
    const { updates } = engine.evaluate(formulas, { timeEntry: liveEntry }, 'TIME_ENTRY_UPDATED');
    if (!updates.length) {
      continue;
    }

    if (!params.dryRun) {
      await clockifyClient.patchTimeEntryCustomFields(
        workspaceId,
        liveEntry.id,
        { customFieldValues: updates.map((item) => ({ customFieldId: item.customFieldId, value: item.value })) },
        { correlationId }
      );
      await recordRun({
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'success',
        ms: 0,
        diff: { updates, backfill: true }
      });
    }

    outcomes.push({ entryId: liveEntry.id, updates: updates.length, correlationId });
  }

  return {
    scanned: entries.length,
    updated: outcomes.length,
    dryRun: params.dryRun ?? false,
    outcomes
  };
};
