import type { RequestHandler } from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { clockifyClient } from '../lib/clockifyClient.js';
import { verifyClockifySignature } from '../lib/webhookSecurity.js';
import { fetchFormulaEngineInputs } from '../services/formulaService.js';
import { FormulaEngine } from '../lib/formulaEngine.js';
import { computeOtSummary } from '../lib/otRules.js';
import { CONFIG } from '../config/index.js';
import { getBackendUrlFromMemory, getInstallationTokenFromMemory } from '../services/installMemory.js';
import { clockifyTimeEntrySchema, ClockifyWebhookEvent } from '../types/clockify.js';
import { recordRun } from '../services/runService.js';
import { logger } from '../lib/logger.js';
import { seenOnce } from '../lib/kv.js';

// Rate-limited logging for workspace mismatches (once per minute)
const workspaceMismatchLog = new Map<string, number>();

const PATCH_FINGERPRINT_TTL_SEC = 30 * 60; // 30 minutes (persistent across serverless restarts)
const buildFingerprintKey = (workspaceId: string, entryId: string, fingerprint: string) =>
  `wh:fp:${workspaceId}:${entryId}:${fingerprint}`;

/**
 * Check if a fingerprint has been seen before for this workspace+entry combination
 * Uses KV for persistent storage across serverless function restarts
 * @returns true if fingerprint should be skipped (already processed), false if should proceed
 */
const shouldSkipFingerprint = async (workspaceId: string, entryId: string, fingerprint: string): Promise<boolean> => {
  const key = buildFingerprintKey(workspaceId, entryId, fingerprint);
  // seenOnce returns true if key already exists (seen before), false if first time
  return await seenOnce(key, PATCH_FINGERPRINT_TTL_SEC);
};

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

    const rawBody = (req as any).rawBody ?? JSON.stringify(req.body ?? {});
    const signature = req.header('x-clockify-signature');
    if (!verifyClockifySignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const correlationId: string = (req as any).correlationId ?? randomUUID();

    const event = resolveEventType(req.body, req.header('x-clockify-event'));
    if (!event) {
      return res.status(400).json({ error: 'Missing event type' });
    }

    if (event === 'TIME_ENTRY_DELETED') {
      await recordRun({
        workspaceId: CONFIG.WORKSPACE_ID,
        entryId: (req.body as { id?: string })?.id ?? 'unknown',
        status: 'skipped',
        ms: 0,
        event,
        correlationId,
        diff: { reason: 'Time entry deleted event' }
      });
      return res.status(200).json({ ok: true });
    }

    const payload = extractTimeEntryPayload(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Unsupported payload shape for time entry webhook' });
    }

    const workspaceId = payload.workspaceId ?? CONFIG.WORKSPACE_ID;
    if (CONFIG.WORKSPACE_ID && workspaceId !== CONFIG.WORKSPACE_ID) {
      const tokenForWs = getInstallationTokenFromMemory(workspaceId);
      if (!tokenForWs && !CONFIG.DEV_ALLOW_UNSIGNED) {
        const key = `${workspaceId}:${event}`;
        const now = Date.now();
        const lastLogged = workspaceMismatchLog.get(key);
        if (!lastLogged || now - lastLogged > 60000) {
          logger.warn({ event, workspaceId }, 'Received event for mismatched workspace without token; ignoring');
          workspaceMismatchLog.set(key, now);
        }
        return res.status(200).json({ ok: true, message: 'Workspace mismatch ignored' });
      }
      // If we have a token cached for this workspace (or dev unsigned), proceed.
    }

    const start = performance.now();
    const authToken = getInstallationTokenFromMemory(workspaceId);
    const baseOverride = getBackendUrlFromMemory(workspaceId);
    if (!authToken && !CONFIG.API_KEY && !CONFIG.ADDON_TOKEN) {
      return res.status(401).json({ error: 'No installation token available for workspace' });
    }
    const liveEntry = await clockifyClient.getTimeEntry(workspaceId, payload.id, correlationId, authToken, baseOverride);
    const otSummary = await computeOtSummary({
      workspaceId,
      timeEntry: liveEntry,
      client: clockifyClient,
      correlationId,
      baseUrlOverride: baseOverride
    });
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
      { timeEntry: liveEntry, otSummary },
      event
    );

    if (!updates.length) {
      await recordRun({
        workspaceId,
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'skipped',
        ms: Math.round(performance.now() - start),
        event,
        correlationId,
        diff: { reason: 'No formula changes', warnings, ot: otSummary }
      });
      return res.status(200).json({ ok: true, changes: 0, diagnostics, warnings });
    }

    const diff = updates.map((update) => ({
      fieldKey: update.fieldKey,
      customFieldId: update.customFieldId,
      before: beforeValues.get(update.customFieldId) ?? null,
      after: update.value
    }));
    const fingerprint = createHash('sha256').update(JSON.stringify(diff)).digest('hex');

    const latest = await clockifyClient.getTimeEntry(workspaceId, liveEntry.id, correlationId, authToken, baseOverride);
    const latestHash = hashCustomFieldValues((latest.customFieldValues ?? []).map(cf => ({ 
      customFieldId: cf.customFieldId, 
      value: cf.value ?? null 
    })));
    if (latestHash !== beforeHash) {
      await recordRun({
        workspaceId,
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'skipped',
        ms: Math.round(performance.now() - start),
        event,
        correlationId,
        diff: { reason: 'Custom fields changed during evaluation', ot: otSummary, beforeHash, latestHash }
      });
      return res.status(202).json({ ok: true, changes: 0, diagnostics, warnings, retried: true });
    }

    if (await shouldSkipFingerprint(workspaceId, liveEntry.id, fingerprint)) {
      await recordRun({
        workspaceId,
        entryId: liveEntry.id,
        userId: liveEntry.userId,
        status: 'skipped',
        ms: Math.round(performance.now() - start),
        event,
        correlationId,
        diff: { reason: 'Duplicate fingerprint (KV cache)', warnings, ot: otSummary, fingerprint }
      });
      return res.status(200).json({ ok: true, changes: 0, diagnostics, warnings, duplicate: true });
    }

    await clockifyClient.patchTimeEntryCustomFields(
      workspaceId,
      liveEntry.id,
      {
        customFieldValues: updates.map((item) => ({ customFieldId: item.customFieldId, value: item.value }))
      },
      { correlationId, authToken, baseUrlOverride: baseOverride }
    );
    const duration = Math.round(performance.now() - start);
    // Fingerprint already stored in KV by shouldSkipFingerprint check
    await recordRun({
      workspaceId,
      entryId: liveEntry.id,
      userId: liveEntry.userId,
      status: 'success',
      ms: duration,
      event,
      correlationId,
      diff: { changes: diff, warnings, ot: otSummary, beforeHash, latestHash, fingerprint }
    });

    logger.info({ correlationId, entryId: liveEntry.id, updates }, 'Applied custom field updates');

    return res.status(200).json({ ok: true, changes: updates.length, diagnostics, warnings });
  } catch (error) {
    next(error);
  }
};
