import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { DictionaryRule, FormulaDefinition } from '../lib/formulaEngine.js';
import { ClockifyWebhookEvent } from '../types/clockify.js';

const formulaRowSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  field_key: z.string(),
  expr: z.string(),
  priority: z.number(),
  on_events: z.array(z.string()).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable()
});

const dictionaryRowSchema = z.object({
  field_key: z.string(),
  allowed_values: z.unknown()
});

type FormulaRow = z.infer<typeof formulaRowSchema>;
type DictionaryRow = z.infer<typeof dictionaryRowSchema>;

type DictionaryPayload = {
  type?: 'dropdown' | 'numeric';
  allowedValues?: string[];
  numericRange?: { min?: number; max?: number };
  mode?: 'warn' | 'block' | 'autofix';
};

const mapFormulaRow = (row: FormulaRow): FormulaDefinition => ({
  id: row.id,
  workspaceId: row.workspace_id,
  fieldKey: row.field_key,
  expr: row.expr,
  priority: row.priority,
  onEvents: (row.on_events as ClockifyWebhookEvent[] | null) ?? null
});

const mapDictionaryRow = (row: DictionaryRow): DictionaryRule => {
  const payload = (row.allowed_values as DictionaryPayload) ?? {};
  const type = payload.type ?? (payload.allowedValues ? 'dropdown' : 'numeric');
  return {
    fieldKey: row.field_key,
    type,
    allowedValues: payload.allowedValues,
    numericRange: payload.numericRange,
    mode: payload.mode ?? 'warn'
  };
};

export const fetchFormulaEngineInputs = async (workspaceId: string) => {
  const db = getDb();
  const [formulasResult, dictionariesResult] = await Promise.all([
    db.query('SELECT * FROM formulas WHERE workspace_id = $1 ORDER BY priority ASC', [workspaceId]),
    db.query('SELECT * FROM dictionaries WHERE field_key IS NOT NULL')
  ]);

  const formulas = formulasResult.rows.map((row) => mapFormulaRow(formulaRowSchema.parse(row)));
  const dictionariesArray = dictionariesResult.rows.map((row) => mapDictionaryRow(dictionaryRowSchema.parse(row)));
  const dictionaries = new Map(dictionariesArray.map((item) => [item.fieldKey, item] as const));
  return { formulas, dictionaries };
};

export const listFormulas = async (workspaceId: string) => {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM formulas WHERE workspace_id = $1 ORDER BY priority ASC', [workspaceId]);
  return rows.map((row) => mapFormulaRow(formulaRowSchema.parse(row)));
};

type UpsertFormulaInput = {
  fieldKey: string;
  expr: string;
  priority: number;
  onEvents: ClockifyWebhookEvent[];
};

export const createFormula = async (workspaceId: string, input: UpsertFormulaInput) => {
  const db = getDb();
  const id = randomUUID();
  await db.query(
    `INSERT INTO formulas (id, workspace_id, field_key, expr, priority, on_events)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, workspaceId, input.fieldKey, input.expr, input.priority, input.onEvents]
  );
  return {
    id,
    workspaceId,
    fieldKey: input.fieldKey,
    expr: input.expr,
    priority: input.priority,
    onEvents: input.onEvents
  } satisfies FormulaDefinition;
};

export const updateFormula = async (workspaceId: string, id: string, input: UpsertFormulaInput) => {
  const db = getDb();
  await db.query(
    `UPDATE formulas
     SET field_key = $3, expr = $4, priority = $5, on_events = $6, updated_at = NOW()
     WHERE id = $1 AND workspace_id = $2`,
    [id, workspaceId, input.fieldKey, input.expr, input.priority, input.onEvents]
  );
};

export const deleteFormula = async (workspaceId: string, id: string) => {
  const db = getDb();
  await db.query('DELETE FROM formulas WHERE id = $1 AND workspace_id = $2', [id, workspaceId]);
};

export const listDictionaries = async () => {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM dictionaries');
  return rows.map((row) => mapDictionaryRow(dictionaryRowSchema.parse(row)));
};

export const upsertDictionary = async (fieldKey: string, payload: DictionaryPayload) => {
  const db = getDb();
  await db.query(
    `INSERT INTO dictionaries (field_key, allowed_values)
     VALUES ($1, $2)
     ON CONFLICT (field_key) DO UPDATE SET allowed_values = $2`,
    [fieldKey, payload]
  );
};

export const deleteDictionary = async (fieldKey: string) => {
  const db = getDb();
  await db.query('DELETE FROM dictionaries WHERE field_key = $1', [fieldKey]);
};
