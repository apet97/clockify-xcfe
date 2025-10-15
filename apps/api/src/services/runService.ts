import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '../lib/db.js';

const runRowSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  entry_id: z.string().nullable(),
  user_id: z.string().nullable(),
  event: z.string().nullable(),
  status: z.string(),
  ms: z.number().nullable(),
  diff: z.unknown().nullable(),
  correlation_id: z.string().nullable(),
  request_id: z.string().nullable(),
  created_at: z.string()
});

type RunRow = z.infer<typeof runRowSchema>;

export type RunRecord = {
  id: string;
  workspaceId: string;
  entryId?: string | null;
  userId?: string | null;
  event?: string | null;
  ts: Date;
  status: string;
  ms?: number | null;
  diff?: unknown;
  correlationId?: string | null;
  requestId?: string | null;
};

export type RecordRunInput = {
  workspaceId: string;
  entryId?: string | null;
  userId?: string | null;
  status: 'success' | 'skipped' | 'error';
  ms: number;
  diff: unknown;
  event?: string | null;
  correlationId?: string | null;
  requestId?: string | null;
};

export const recordRun = async (input: RecordRunInput): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  await db.query(
    `INSERT INTO runs (id, workspace_id, entry_id, user_id, event, status, ms, diff, correlation_id, request_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
    [
      id,
      input.workspaceId,
      input.entryId ?? null,
      input.userId ?? null,
      input.event ?? null,
      input.status,
      input.ms,
      input.diff ?? null,
      input.correlationId ?? null,
      input.requestId ?? null
    ]
  );
  return id;
};

export const listRecentRuns = async (limit = 100): Promise<RunRecord[]> => {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM runs ORDER BY created_at DESC LIMIT $1', [limit]);
  return rows.map((row) => {
    const parsed = runRowSchema.parse(row);
    return {
      id: parsed.id,
      workspaceId: parsed.workspace_id,
      entryId: parsed.entry_id ?? undefined,
      userId: parsed.user_id ?? undefined,
      event: parsed.event ?? undefined,
      ts: new Date(parsed.created_at),
      status: parsed.status,
      ms: parsed.ms ?? undefined,
      diff: parsed.diff ?? undefined,
      correlationId: parsed.correlation_id ?? undefined,
      requestId: parsed.request_id ?? undefined
    } satisfies RunRecord;
  });
};
