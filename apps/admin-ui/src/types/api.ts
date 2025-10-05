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
    error?: string;
  }>;
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

export type Settings = {
  strict_mode: boolean;
  reference_months: number;
  region?: string;
};

export type DryRunPreview = {
  entryId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  updates: Array<{
    customFieldId: string;
    value: unknown;
  }>;
};

export type HealthStatus = {
  ok: boolean;
  db: {
    reachable: boolean;
    schemaVersion?: string;
  };
  workspaceId: string;
  timestamp: string;
};
