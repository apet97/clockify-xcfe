export type Formula = {
  id: string;
  fieldKey: string;
  expr: string;
  priority: number;
  onEvents: string[];
};

export type DictionaryRule = {
  fieldKey: string;
  type: 'dropdown' | 'numeric';
  allowedValues?: string[];
  numericRange?: { min?: number; max?: number };
  mode: 'warn' | 'block' | 'autofix';
};

export type BackfillResult = {
  scanned: number;
  updated: number;
  dryRun: boolean;
  outcomes: { entryId: string; updates: number; correlationId: string }[];
};

export type RunRecord = {
  id: string;
  entryId: string;
  userId?: string | null;
  status: string;
  ts: string;
  ms?: number | null;
  diff?: unknown;
};
