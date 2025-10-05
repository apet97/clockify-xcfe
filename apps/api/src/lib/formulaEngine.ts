import { Parser } from 'expr-eval';
import { ClockifyTimeEntry, ClockifyWebhookEvent } from '../types/clockify.js';

export type FieldValidationMode = 'warn' | 'block' | 'autofix';

export type DictionaryRule = {
  fieldKey: string;
  type: 'dropdown' | 'numeric';
  allowedValues?: string[];
  numericRange?: { min?: number; max?: number };
  mode: FieldValidationMode;
};

export type FormulaDefinition = {
  id: string;
  workspaceId: string;
  fieldKey: string;
  expr: string;
  priority: number;
  onEvents: ClockifyWebhookEvent[] | null;
};

export type FormulaEvaluationContext = {
  timeEntry: ClockifyTimeEntry;
  billRate?: number | null;
  costRate?: number | null;
};

export type ValidationIssue = {
  fieldKey: string;
  message: string;
  severity: 'warn' | 'error';
  mode: FieldValidationMode;
  code: 'dropdown.invalid' | 'numeric.range' | 'value.invalid';
  attemptedAutoFix?: boolean;
};

export type FormulaEvaluationResult = {
  updates: { customFieldId: string; fieldKey: string; value: unknown }[];
  diagnostics: ValidationIssue[];
  changes: Record<string, unknown>;
  warnings: string[];
};

const CF_REFERENCE_REGEX = /CF\((?:"([^"]+)"|'([^']+)')\)/g;

const parser = new Parser({
  operators: {
    logical: true,
    comparison: true,
    conditional: true,
    pow: true
  }
});

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  throw new Error('DATE expects a valid string or timestamp');
};

const getDurationHours = (timeEntry: ClockifyTimeEntry): number => {
  const { timeInterval } = timeEntry;
  if (!timeInterval) return 0;
  const { duration, start, end } = timeInterval;
  if (duration) {
    const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (isoMatch) {
      const hours = Number(isoMatch[1] ?? 0);
      const minutes = Number(isoMatch[2] ?? 0);
      const seconds = Number(isoMatch[3] ?? 0);
      return hours + minutes / 60 + seconds / 3600;
    }
  }
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
      return diffMs / (1000 * 60 * 60);
    }
  }
  return 0;
};

const weekNumber = (date: Date) => {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }
  return false;
};

const parseDependencies = (expr: string): string[] => {
  const results = new Set<string>();
  for (const match of expr.matchAll(CF_REFERENCE_REGEX)) {
    const key = match[1] ?? match[2];
    if (key) results.add(key);
  }
  return Array.from(results);
};

const topologicalSort = (formulas: FormulaDefinition[]): FormulaDefinition[] => {
  const dependencyMap = new Map<string, string[]>();
  const formulaByField = new Map<string, FormulaDefinition>();

  for (const f of formulas) {
    dependencyMap.set(f.fieldKey, parseDependencies(f.expr));
    formulaByField.set(f.fieldKey, f);
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: FormulaDefinition[] = [];

  const dfs = (fieldKey: string) => {
    if (visited.has(fieldKey)) return;
    if (visiting.has(fieldKey)) {
      throw new Error(`Circular dependency detected for field ${fieldKey}`);
    }
    visiting.add(fieldKey);
    const dependencies = dependencyMap.get(fieldKey) ?? [];
    for (const dep of dependencies) {
      if (!formulaByField.has(dep)) continue;
      dfs(dep);
    }
    visiting.delete(fieldKey);
    visited.add(fieldKey);
    const formula = formulaByField.get(fieldKey);
    if (formula) result.push(formula);
  };

  const sortedByPriority = [...formulas].sort((a, b) => a.priority - b.priority);
  for (const formula of sortedByPriority) {
    dfs(formula.fieldKey);
  }

  return result;
};

type CustomFieldValue = {
  fieldKey: string;
  customFieldId: string;
  value: unknown;
};

const buildFieldState = (timeEntry: ClockifyTimeEntry) => {
  const byKey = new Map<string, CustomFieldValue>();

  for (const cf of timeEntry.customFieldValues ?? []) {
    const fieldKey = cf.name ?? cf.customFieldId;
    const record: CustomFieldValue = {
      fieldKey,
      customFieldId: cf.customFieldId,
      value: cf.value ?? null
    };
    byKey.set(fieldKey, record);
    byKey.set(cf.customFieldId, record);
  }

  return {
    get(fieldKey: string) {
      return byKey.get(fieldKey);
    },
    set(fieldKey: string, update: CustomFieldValue) {
      byKey.set(fieldKey, update);
      byKey.set(update.customFieldId, update);
      if (update.fieldKey !== update.customFieldId) {
        byKey.set(update.fieldKey, update);
      }
    }
  };
};

const installFunctions = () => {
  parser.functions.ROUND = (value: number, decimals = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };
  parser.functions.MIN = Math.min;
  parser.functions.MAX = Math.max;
  parser.functions.IF = (condition: boolean, whenTrue: unknown, whenFalse: unknown) => (condition ? whenTrue : whenFalse);
  parser.functions.AND = (...args: unknown[]) => args.every(Boolean);
  parser.functions.OR = (...args: unknown[]) => args.some(Boolean);
  parser.functions.NOT = (value: unknown) => !value;
  parser.functions.IN = (needle: unknown, ...haystack: unknown[]) => haystack.some((value) => deepEqual(value, needle));
  parser.functions.REGEXMATCH = (text: string, pattern: string, flags = '') => {
    const re = new RegExp(pattern, flags);
    return re.test(text ?? '');
  };
  parser.functions.DATE = (input: unknown) => toDate(input);
  parser.functions.HOUR = (input: unknown) => toDate(input).getUTCHours();
  parser.functions.WEEKDAY = (input: unknown) => {
    const date = toDate(input);
    const day = date.getUTCDay();
    return day === 0 ? 7 : day;
  };
  parser.functions.WEEKNUM = (input: unknown) => weekNumber(toDate(input));
};

installFunctions();

export class FormulaEngine {
  constructor(private readonly dictionaries: Map<string, DictionaryRule> = new Map()) {}

  evaluate(
    formulas: FormulaDefinition[],
    context: FormulaEvaluationContext,
    event: ClockifyWebhookEvent
  ): FormulaEvaluationResult {
    const applicable = formulas.filter((formula) => {
      const triggers = formula.onEvents && formula.onEvents.length ? formula.onEvents : null;
      return !triggers || triggers.includes(event);
    });

    const executionPlan = topologicalSort(applicable);
    const state = buildFieldState(context.timeEntry);
    const diagnostics: ValidationIssue[] = [];
    const applied = new Map<string, unknown>();

    const baseScope = this.buildScope(context.timeEntry, context, applied);
    const updates: { customFieldId: string; fieldKey: string; value: unknown }[] = [];
    const changes: Record<string, unknown> = {};

    for (const formula of executionPlan) {
      const expr = parser.parse(formula.expr);
      const scope = {
        ...baseScope,
        CF: (fieldName: string) => {
          const ref = state.get(fieldName);
          if (!ref) return null;
          return ref.value;
        }
      };

      let value: unknown;
      try {
        value = expr.evaluate(scope);
      } catch (error) {
        diagnostics.push({
          fieldKey: formula.fieldKey,
          mode: 'warn',
          severity: 'error',
          code: 'dropdown.invalid',
          message: `Failed to evaluate formula ${formula.id}: ${(error as Error).message}`
        });
        continue;
      }

      if (typeof value === 'number' && !Number.isFinite(value)) {
        diagnostics.push({
          fieldKey: formula.fieldKey,
          mode: 'block',
          severity: 'error',
          code: 'value.invalid',
          message: `Formula ${formula.id} produced a non-finite number`
        });
        continue;
      }

      const target = state.get(formula.fieldKey);
      if (!target) {
        diagnostics.push({
          fieldKey: formula.fieldKey,
          mode: 'block',
          severity: 'error',
          code: 'dropdown.invalid',
          message: `Custom field ${formula.fieldKey} not present on time entry`
        });
        continue;
      }

      const validated = this.applyValidation(formula.fieldKey, value, diagnostics);
      if (!deepEqual(validated, target.value)) {
        state.set(formula.fieldKey, {
          fieldKey: formula.fieldKey,
          customFieldId: target.customFieldId,
          value: validated
        });
        updates.push({
          customFieldId: target.customFieldId,
          fieldKey: formula.fieldKey,
          value: validated
        });
        applied.set(formula.fieldKey, validated);
        changes[formula.fieldKey] = validated;
      }
    }

    const warnings = diagnostics.filter((item) => item.severity === 'warn').map((item) => item.message);

    return { updates, diagnostics, changes, warnings };
  }

  private buildScope(
    timeEntry: ClockifyTimeEntry,
    context: FormulaEvaluationContext,
    applied: Map<string, unknown>
  ) {
    const durationHours = getDurationHours(timeEntry);
    const start = timeEntry.timeInterval?.start ? new Date(timeEntry.timeInterval.start) : undefined;
    const end = timeEntry.timeInterval?.end ? new Date(timeEntry.timeInterval.end) : undefined;

    return {
      Duration: { h: durationHours },
      Start: { tz: start?.toISOString() ?? null },
      End: { tz: end?.toISOString() ?? null },
      Billable: timeEntry.billable ?? false,
      Desc: timeEntry.description ?? '',
      Tags: (timeEntry.tags ?? []).map((tag) => tag.name),
      User: { name: timeEntry.user?.name ?? '' },
      Project: { name: timeEntry.project?.name ?? '' },
      Task: { name: timeEntry.task?.name ?? '' },
      BillRate: context.billRate ?? timeEntry.hourlyRate?.amount ?? null,
      CostRate: context.costRate ?? timeEntry.costRate?.amount ?? null,
      Applied: applied
    };
  }

  private applyValidation(fieldKey: string, value: unknown, diagnostics: ValidationIssue[]) {
    const rule = this.dictionaries.get(fieldKey);
    if (!rule) return value;

    if (rule.type === 'dropdown') {
      const allowed = rule.allowedValues ?? [];
      if (!allowed.some((item) => deepEqual(item, value))) {
        if (rule.mode === 'block') {
          diagnostics.push({
            fieldKey,
            code: 'dropdown.invalid',
            severity: 'error',
            message: `Dropdown value ${String(value)} is not allowed for ${fieldKey}`,
            mode: rule.mode
          });
          return value;
        }
        if (rule.mode === 'autofix' && allowed.length) {
          diagnostics.push({
            fieldKey,
            code: 'dropdown.invalid',
            severity: 'warn',
            message: `Value ${String(value)} replaced with ${allowed[0]} to satisfy dropdown dictionary`,
            mode: rule.mode,
            attemptedAutoFix: true
          });
          return allowed[0];
        }
        diagnostics.push({
          fieldKey,
          code: 'dropdown.invalid',
          severity: 'warn',
          message: `Value ${String(value)} not in dropdown dictionary for ${fieldKey}`,
          mode: rule.mode
        });
        return value;
      }
      return value;
    }

    if (rule.type === 'numeric') {
      if (value == null) return value;
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        diagnostics.push({
          fieldKey,
          code: 'value.invalid',
          severity: 'warn',
          message: `Value for ${fieldKey} is not numeric`,
          mode: rule.mode
        });
        return value;
      }
      const { min, max } = rule.numericRange ?? {};
      let adjusted = numeric;
      if (typeof min === 'number' && numeric < min) adjusted = min;
      if (typeof max === 'number' && numeric > max) adjusted = max;
      if (adjusted !== numeric) {
        if (rule.mode === 'block') {
          diagnostics.push({
            fieldKey,
            code: 'numeric.range',
            severity: 'error',
            message: `Numeric value ${numeric} outside range for ${fieldKey}`,
            mode: rule.mode
          });
          return value;
        }
        const severity = 'warn';
        diagnostics.push({
          fieldKey,
          code: 'numeric.range',
          severity,
          message: `Numeric value ${numeric} adjusted to ${adjusted} for ${fieldKey}`,
          mode: rule.mode,
          attemptedAutoFix: rule.mode === 'autofix'
        });
        return rule.mode === 'autofix' ? adjusted : value;
      }
    }

    return value;
  }
}

export const extractDependencies = (expr: string) => parseDependencies(expr);
