import { Parser } from 'expr-eval';
import { ClockifyTimeEntry, ClockifyWebhookEvent } from '../types/clockify.js';
import { getDurationHours } from './timeUtils.js';
import type { OtSummary } from './otRules.js';

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
  otSummary?: OtSummary | null;
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
    conditional: true
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

const createOtHelper = (summary: OtSummary) => {
  const fn = ((key?: string) => {
    if (!key) return summary.multiplier;
    const normalized = String(key).toLowerCase();
    switch (normalized) {
      case 'multiplier':
        return summary.multiplier;
      case 'base':
      case 'basemultiplier':
        return summary.baseMultiplier;
      case 'flag':
        return summary.flag;
      case 'dailyhours':
        return summary.dailyHours;
      case 'entryhours':
        return summary.entryHours;
      case 'restgaphours':
        return summary.restGapHours;
      case 'shortrest':
        return summary.shortRest;
      case 'previousentryid':
        return summary.previousEntryId ?? null;
      case 'daykey':
        return summary.dayKey;
      case 'daystartutc':
        return summary.dayStartUtc;
      case 'dayendutc':
        return summary.dayEndUtc;
      default:
        return (summary as unknown as Record<string, unknown>)[normalized] ?? null;
    }
  }) as ((key?: string) => unknown) & OtSummary;
  return Object.assign(fn, summary);
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

const coerceNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('NaN and Infinity values are not allowed in formulas');
    }
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Cannot convert "${value}" to a finite number`);
    }
    return parsed;
  }
  throw new Error(`Cannot convert ${typeof value} to number`);
};

const validateRegexPattern = (pattern: string, flags: string) => {
  // Prevent catastrophic backtracking and other dangerous patterns
  if (pattern.length > 100) {
    throw new Error('Regex pattern too long');
  }
  if (flags.length > 10) {
    throw new Error('Regex flags too long');
  }
  if (pattern.includes('(?') || pattern.includes('(?(')) {
    throw new Error('Conditional regex patterns not allowed');
  }
  // Basic check for excessive nesting that could cause DoS
  const nestingLevel = (pattern.match(/\(/g) || []).length;
  if (nestingLevel > 10) {
    throw new Error('Regex pattern too complex');
  }
};

// Whitelist of allowed functions - security measure to prevent code injection
const ALLOWED_FUNCTIONS = new Set([
  'ROUND', 'MIN', 'MAX', 'IF', 'AND', 'OR', 'NOT', 'IN', 
  'REGEXMATCH', 'DATE', 'HOUR', 'WEEKDAY', 'WEEKNUM', 'CF', 'OT', 'OTLABEL'
]);

const installFunctions = () => {
  // Clear any existing functions first for security
  parser.functions = {};
  
  parser.functions.ROUND = (value: unknown, decimals: unknown = 0) => {
    const num = coerceNumber(value);
    const dec = coerceNumber(decimals);
    if (dec < 0 || dec > 10) {
      throw new Error('ROUND decimals must be between 0 and 10');
    }
    const factor = Math.pow(10, dec);
    const result = Math.round(num * factor) / factor;
    return coerceNumber(result); // Ensure result is finite
  };
  
  parser.functions.MIN = (...args: unknown[]) => {
    if (args.length === 0) throw new Error('MIN requires at least one argument');
    const numbers = args.map(coerceNumber);
    return Math.min(...numbers);
  };
  
  parser.functions.MAX = (...args: unknown[]) => {
    if (args.length === 0) throw new Error('MAX requires at least one argument');
    const numbers = args.map(coerceNumber);
    return Math.max(...numbers);
  };
  
  parser.functions.IF = (condition: unknown, whenTrue: unknown, whenFalse: unknown) => {
    return Boolean(condition) ? whenTrue : whenFalse;
  };
  
  parser.functions.AND = (...args: unknown[]) => {
    if (args.length === 0) return true;
    return args.every(Boolean);
  };
  
  parser.functions.OR = (...args: unknown[]) => {
    if (args.length === 0) return false;
    return args.some(Boolean);
  };
  
  parser.functions.NOT = (value: unknown) => !value;
  
  parser.functions.IN = (needle: unknown, ...haystack: unknown[]) => {
    if (haystack.length === 0) return false;
    return haystack.some((value) => deepEqual(value, needle));
  };
  
  parser.functions.REGEXMATCH = (text: unknown, pattern: unknown, flags: unknown = '') => {
    const textStr = String(text ?? '');
    const patternStr = String(pattern);
    const flagsStr = String(flags);
    
    validateRegexPattern(patternStr, flagsStr);
    
    try {
      const re = new RegExp(patternStr, flagsStr);
      return re.test(textStr);
    } catch (error) {
      throw new Error(`Invalid regex: ${(error as Error).message}`);
    }
  };
  
  parser.functions.DATE = (input: unknown) => toDate(input);
  
  parser.functions.HOUR = (input: unknown) => {
    const date = toDate(input);
    return date.getUTCHours();
  };
  
  parser.functions.WEEKDAY = (input: unknown) => {
    const date = toDate(input);
    const day = date.getUTCDay();
    return day === 0 ? 7 : day;
  };
  
  parser.functions.WEEKNUM = (input: unknown) => {
    const date = toDate(input);
    return weekNumber(date);
  };
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
      // Security validation: check for disallowed functions
      const expressionStr = formula.expr.toUpperCase();
      const functionMatches = expressionStr.match(/\b([A-Z_][A-Z0-9_]*)\s*\(/g);
      if (functionMatches) {
        for (const match of functionMatches) {
          const funcName = match.replace(/\s*\($/, '');
          if (!ALLOWED_FUNCTIONS.has(funcName)) {
            diagnostics.push({
              fieldKey: formula.fieldKey,
              mode: 'block',
              severity: 'error',
              code: 'value.invalid',
              message: `Function '${funcName}' is not allowed in formulas`
            });
            continue;
          }
        }
        // If any disallowed functions were found, skip this formula
        if (diagnostics.some(d => d.fieldKey === formula.fieldKey && d.message.includes('not allowed'))) {
          continue;
        }
      }

      let expr;
      try {
        expr = parser.parse(formula.expr);
      } catch (parseError) {
        diagnostics.push({
          fieldKey: formula.fieldKey,
          mode: 'warn',
          severity: 'error',
          code: 'value.invalid',
          message: `Failed to parse formula ${formula.id}: ${(parseError as Error).message}`
        });
        continue;
      }
      
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
        value = expr.evaluate(scope as any);
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

    const ot: OtSummary = context.otSummary ?? {
      multiplier: 1,
      baseMultiplier: 1,
      flag: 'REG',
      dailyHours: durationHours,
      entryHours: durationHours,
      restGapHours: null,
      shortRest: false,
      previousEntryId: undefined,
      timezoneOffsetMinutes: 0,
      dayKey: '',
      dayStartUtc: start ? start.toISOString() : '',
      dayEndUtc: end ? end.toISOString() : ''
    };

    const otHelper = createOtHelper(ot);

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
      Applied: applied,
      Shift: {
        dailyHours: ot.dailyHours,
        entryHours: ot.entryHours,
        restGapHours: ot.restGapHours,
        shortRest: ot.shortRest,
        previousEntryId: ot.previousEntryId ?? null,
        dayKey: ot.dayKey,
        dayStartUtc: ot.dayStartUtc,
        dayEndUtc: ot.dayEndUtc
      },
      OT: otHelper,
      OTLABEL: () => ot.flag
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
