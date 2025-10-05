import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClockifyTimeEntry } from '@api/types/clockify.js';

vi.mock('@api/services/formulaService.js', () => ({
  fetchFormulaEngineInputs: vi.fn()
}));

vi.mock('@api/services/runService.js', () => ({
  recordRun: vi.fn()
}));

vi.mock('@api/lib/clockifyClient.js', () => ({
  clockifyClient: {
    getTimeEntry: vi.fn(),
    patchTimeEntryCustomFields: vi.fn(),
    listWebhooks: vi.fn(),
    createWebhook: vi.fn()
  }
}));

const markdown = readFileSync('docs/Clockify_Webhook_JSON_Samples (1).md', 'utf8');
const extractSample = (section: string) => {
  const regex = new RegExp(`## ${section}\\n\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``, 'm');
  const match = regex.exec(markdown);
  if (!match) {
    throw new Error(`Sample ${section} not found`);
  }
  return JSON.parse(match[1]);
};

const webhookPayload = extractSample('NEW_TIME_ENTRY');

const { clockifyWebhookHandler } = await import('@api/controllers/webhookController.js');
const { fetchFormulaEngineInputs } = await import('@api/services/formulaService.js');
const { clockifyClient } = await import('@api/lib/clockifyClient.js');
const { recordRun } = await import('@api/services/runService.js');

const baseTimeEntry: ClockifyTimeEntry = {
  ...webhookPayload,
  timeInterval: webhookPayload.timeInterval,
  customFieldValues: [
    { customFieldId: 'rate-field', name: 'Rate', value: 75, timeEntryId: webhookPayload.id },
    { customFieldId: 'amount-field', name: 'Amount', value: null, timeEntryId: webhookPayload.id }
  ],
  hourlyRate: { amount: 75 },
  costRate: null,
  billable: true,
  isLocked: false,
  project: webhookPayload.project,
  task: webhookPayload.task,
  user: webhookPayload.user,
  tags: webhookPayload.tags,
  amount: undefined
};

beforeEach(() => {
  vi.clearAllMocks();
  (fetchFormulaEngineInputs as unknown as vi.Mock).mockResolvedValue({
    formulas: [
      {
        id: 'amount',
        workspaceId: webhookPayload.workspaceId,
        fieldKey: 'Amount',
        expr: 'ROUND(Duration.h * CF("Rate"), 2)',
        priority: 50,
        onEvents: ['NEW_TIME_ENTRY', 'TIME_ENTRY_UPDATED']
      }
    ],
    dictionaries: new Map()
  });
  (clockifyClient.getTimeEntry as unknown as vi.Mock)
    .mockResolvedValueOnce(baseTimeEntry)
    .mockResolvedValueOnce({ ...baseTimeEntry });
  (clockifyClient.patchTimeEntryCustomFields as unknown as vi.Mock).mockResolvedValue(undefined);
  (recordRun as unknown as vi.Mock).mockResolvedValue('run-1');
});

describe('Clockify webhook handler', () => {
  it('validates signature, evaluates formulas, and patches custom fields', async () => {
    const rawBody = JSON.stringify(webhookPayload);
    const signature = createHmac('sha256', 'test-secret').update(rawBody).digest('hex');

    const req = {
      body: webhookPayload,
      rawBody,
      header: vi.fn((name: string) => {
        if (name.toLowerCase() === 'x-clockify-signature') return `sha256=${signature}`;
        if (name.toLowerCase() === 'x-clockify-event') return 'NEW_TIME_ENTRY';
        return undefined;
      }),
      correlationId: 'corr-1'
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;

    const next = vi.fn();

    await clockifyWebhookHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(clockifyClient.getTimeEntry).toHaveBeenCalledTimes(2);
    expect(clockifyClient.patchTimeEntryCustomFields).toHaveBeenCalledWith(
      webhookPayload.workspaceId,
      webhookPayload.id,
      { customFieldValues: [{ customFieldId: 'amount-field', value: 75 }] },
      { correlationId: 'corr-1' }
    );
    expect(recordRun).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects requests with invalid signatures', async () => {
    const rawBody = JSON.stringify(webhookPayload);

    const req = {
      body: webhookPayload,
      rawBody,
      header: vi.fn((name: string) => {
        if (name.toLowerCase() === 'x-clockify-signature') return 'sha256=invalid';
        if (name.toLowerCase() === 'x-clockify-event') return 'NEW_TIME_ENTRY';
        return undefined;
      }),
      correlationId: 'corr-2'
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;

    const next = vi.fn();

    await clockifyWebhookHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(clockifyClient.patchTimeEntryCustomFields).not.toHaveBeenCalled();
    expect(recordRun).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
