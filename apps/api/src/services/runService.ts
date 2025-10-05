import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '../lib/db.js';

const runRowSchema = z.object({
  id: z.string(),
  entry_id: z.string(),
  user_id: z.string().nullable(),
  ts: z.string(),
  status: z.string(),
  ms: z.number().nullable(),
  diff: z.unknown()
});

type RunRow = z.infer<typeof runRowSchema>;

export type RunRecord = {
  id: string;
  entryId: string;
  userId?: string | null;
  ts: Date;
  status: string;
  ms?: number | null;
  diff?: unknown;
};

export type RecordRunInput = {
  entryId: string;
  userId?: string | null;
  status: 'success' | 'skipped' | 'error';
  ms: number;
  diff: unknown;
};

export const recordRun = async (input: RecordRunInput): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  await db.query(
    `INSERT INTO runs (id, entry_id, user_id, ts, status, ms, diff)
     VALUES ($1, $2, $3, NOW(), $4, $5, $6)`,
    [id, input.entryId, input.userId ?? null, input.status, input.ms, input.diff]
  );
  return id;
};

export const listRecentRuns = async (limit = 100): Promise<RunRecord[]> => {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM runs ORDER BY ts DESC LIMIT $1', [limit]);
  return rows.map((row) => {
    const parsed = runRowSchema.parse(row);
    return {
      id: parsed.id,
      entryId: parsed.entry_id,
      userId: parsed.user_id,
      ts: new Date(parsed.ts),
      status: parsed.status,
      ms: parsed.ms ?? undefined,
      diff: parsed.diff ?? undefined
    } satisfies RunRecord;
  });
};
