import type { RequestHandler } from 'express';
import { performance } from 'node:perf_hooks';
import { clockifyClient } from '../lib/clockifyClient.js';
import { verifyClockifySignature } from '../lib/webhookSecurity.js';
import { fetchFormulaEngineInputs } from '../services/formulaService.js';
import { FormulaEngine } from '../lib/formulaEngine.js';
import { CONFIG } from '../config/index.js';
import { clockifyTimeEntrySchema, ClockifyWebhookEvent, billableRateUpdatedSchema } from '../types/clockify.js';
import { recordRun } from '../services/runService.js';
import { logger } from '../lib/logger.js';

// Rate-limited logging for workspace mismatches (once per minute)
const workspaceMismatchLog = new Map<string, number>();

const hashCustomFieldValues = (values: { customFieldId: string; value: unknown }[] = []) => {
  const normalized = values
    .map((item) => ({ id: item.customFieldId, value: item.value }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(normalized);
};

const resolveEventType = (reqBody: unknown, headerValue?: string | null): ClockifyWebhookEvent | undefined => {
  const body = reqBody as { event?: string; eventType?: string };
  return (headerValue as ClockifyWebhookEvent | undefined) ?? (body?.eventType as ClockifyWebhookEvent) ?? (body?.event as ClockifyWebhookEvent);
};

const extractTimeEntryPayload = (body: unknown) => {
  if (!body) return null;
  if (typeof body === 'object' && body && 'payload' in body) {
    const payload = (body as { payload: unknown }).payload;
    try {
      return clockifyTimeEntrySchema.parse(payload);
    } catch (error) {
      return null;
    }
  }
  try {
    return clockifyTimeEntrySchema.parse(body);
  } catch (error) {
    return null;
  }
};

export const clockifyWebhookHandler: RequestHandler = async (req, res, next) => {
  try {
    // Verify addon token if present
    const addonToken = req.header('x-addon-token');
    if (CONFIG.ADDON_TOKEN && addonToken !== CONFIG.ADDON_TOKEN) {
      logger.warn({ addonToken: addonToken ? '[REDACTED]' : undefined }, 'Invalid addon token');
      return res.status(403).json({ error: 'Invalid addon token' });
    }

    const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
    const signature = req.header('x-clockify-signature');
    if (!verifyClockifySignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = resolveEventType(req.body, req.header('x-clockify-event'));
    if (!event) {
      return res.status(400).json({ error: 'Missing event type' });
    }

    if (event === 'TIME_ENTRY_DELETED') {
      await recordRun({
        entryId: (req.body as { id?: string })?.id ?? 'unknown',
        status: 'skipped',
        ms: 0,
        diff: { reason: 'Time entry deleted event' }
      });
      return res.status(200).json({ ok: true });
    }

    if (event === 'BILLABLE_RATE_UPDATED') {
      const parsed = billableRateUpdatedSchema.safeParse(req.body);
      if (!parsed.success) {
        logger.warn({ err: parsed.error }, 'Unable to parse BILLABLE_RATE_UPDATED payload');
        return res.status(200).json({ ok: true });
      }
      // For now, record the rate update and return. Future enhancement: enqueue backfill.
      await recordRun({
        entryId: `rate-${parsed.data.modifiedEntity.userId}`,
        userId: parsed.data.modifiedEntity.userId,
        status: 'skipped',
        ms: 0,
        diff: { note: 'Rate change event captured', payload: parsed.data }
      });
      return res.status(200).json({ ok: true, accepted: true });
    }

    const payload = extractTimeEntryPayload(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Unsupported payload shape for time entry webhook' });
    }

    const workspaceId = payload.workspaceId ?? CONFIG.WORKSPACE_ID;
    if (workspaceId !== CONFIG.WORKSPACE_ID) {
      const key = `${workspaceId}:${event}`;
      const now = Date.now();
      const lastLogged = workspaceMismatchLog.get(key);
      if (!lastLogged || now - lastLogged > 60000) {
        logger.warn({ event, workspaceId }, 'Received event for mismatched workspace');
        workspaceMismatchLog.set(key, now);
      }
      return res.status(200).json({ ok: true, message: 'Workspace mismatch ignored' });
    }

    const correlationId = req.correlationId;

    const start = performance.now();
    const liveEntry = await clockifyClient.getTimeEntry(workspaceId, payload.id, correlationId);
    const beforeHash = hashCustomFieldValues((liveEntry.customFieldValues ?? []).map(cf => ({ 
      customFieldId: cf.customFieldId, 
      value: cf.value ?? null 
    })));

    const { formulas, dictionaries } = await fetchFormulaEngineInputs(workspaceId);
    const engine = new FormulaEngine(dictionaries);
    const beforeValues = new Map(
      (liveEntry.customFieldValues ?? []).map(({ customFieldId, value }) => [customFieldId, value ?? null])
    );

    const { updates, diagnostics, changes, warnings } = engine.evaluate(
      formulas,
      { timeEntry: liveEntry },
      event
    );

    if (!updates.length) {
      await recordRun({
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'skipped',
        ms: Math.round(performance.now() - start),
        diff: { reason: 'No formula changes', warnings }
      });
      return res.status(200).json({ ok: true, changes: 0, diagnostics, warnings });
    }

    const latest = await clockifyClient.getTimeEntry(workspaceId, liveEntry.id, correlationId);
    const latestHash = hashCustomFieldValues((latest.customFieldValues ?? []).map(cf => ({ 
      customFieldId: cf.customFieldId, 
      value: cf.value ?? null 
    })));
    if (latestHash !== beforeHash) {
      await recordRun({
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'skipped',
        ms: Math.round(performance.now() - start),
        diff: { reason: 'Custom fields changed during evaluation' }
      });
      return res.status(202).json({ ok: true, changes: 0, diagnostics, warnings, retried: true });
    }

    await clockifyClient.patchTimeEntryCustomFields(
      workspaceId,
      liveEntry.id,
      {
        customFieldValues: updates.map((item) => ({ customFieldId: item.customFieldId, value: item.value }))
      },
      { correlationId }
    );

    const diff = updates.map((update) => ({
      fieldKey: update.fieldKey,
      customFieldId: update.customFieldId,
      before: beforeValues.get(update.customFieldId) ?? null,
      after: update.value
    }));

    const duration = Math.round(performance.now() - start);
    await recordRun({
      entryId: liveEntry.id,
      userId: liveEntry.userId,
      status: 'success',
      ms: duration,
      diff: { changes: diff, warnings }
    });

    logger.info({ correlationId, entryId: liveEntry.id, updates }, 'Applied custom field updates');

    return res.status(200).json({ ok: true, changes: updates.length, diagnostics, warnings });
  } catch (error) {
    next(error);
  }
};
