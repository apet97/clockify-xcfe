import { describe, expect, it } from 'vitest';
import { FormulaEngine, extractDependencies, type DictionaryRule, type FormulaDefinition } from '@api/lib/formulaEngine.js';
import type { ClockifyTimeEntry } from '@api/types/clockify.js';

const baseEntry: ClockifyTimeEntry = {
  id: 'entry-1',
  description: 'Daily work',
  tagIds: [],
  userId: 'user-1',
  billable: true,
  taskId: null,
  projectId: 'project-1',
  timeInterval: {
    start: '2024-03-01T08:00:00Z',
    end: '2024-03-01T17:30:00Z',
    duration: 'PT9H30M'
  },
  workspaceId: 'workspace-1',
  isLocked: false,
  hourlyRate: { amount: 110 },
  costRate: { amount: 55 },
  customFieldValues: [
    { customFieldId: 'rate-field', name: 'Rate', value: 125, timeEntryId: 'entry-1' },
    { customFieldId: 'amount-field', name: 'Amount', value: null, timeEntryId: 'entry-1' },
    { customFieldId: 'ot-flag-field', name: 'OTFlag', value: 'REG', timeEntryId: 'entry-1' }
  ],
  project: { id: 'project-1', name: 'Client Project' },
  task: undefined,
  user: { id: 'user-1', name: 'Jane Dev' },
  tags: []
};

const formulas: FormulaDefinition[] = [
  {
    id: 'amount',
    workspaceId: 'workspace-1',
    fieldKey: 'Amount',
    expr: 'ROUND(Duration.h * CF("Rate"), 2)',
    priority: 10,
    onEvents: ['NEW_TIME_ENTRY', 'TIME_ENTRY_UPDATED']
  },
  {
    id: 'otflag',
    workspaceId: 'workspace-1',
    fieldKey: 'OTFlag',
    expr: 'IF(Duration.h > 8, "OT", "REG")',
    priority: 20,
    onEvents: ['TIME_ENTRY_UPDATED']
  }
];

const dictionaries = new Map<string, DictionaryRule>([
  [
    'OTFlag',
    {
      fieldKey: 'OTFlag',
      type: 'dropdown',
      allowedValues: ['REG', 'OT'],
      mode: 'warn'
    }
  ],
  [
    'Amount',
    {
      fieldKey: 'Amount',
      type: 'numeric',
      numericRange: { min: 0 },
      mode: 'warn'
    }
  ]
]);

describe('FormulaEngine', () => {
  it('computes dependent formulas and updates custom fields', () => {
    const engine = new FormulaEngine(dictionaries);
    const result = engine.evaluate(formulas, { timeEntry: baseEntry }, 'TIME_ENTRY_UPDATED');

    expect(result.updates).toEqual([
      { customFieldId: 'amount-field', fieldKey: 'Amount', value: 1187.5 },
      { customFieldId: 'ot-flag-field', fieldKey: 'OTFlag', value: 'OT' }
    ]);
  });

  it('autofixes dropdowns when allowed set is violated', () => {
    const dict = new Map(dictionaries);
    dict.set('Status', {
      fieldKey: 'Status',
      type: 'dropdown',
      allowedValues: ['A', 'B'],
      mode: 'autofix'
    });

    const engine = new FormulaEngine(dict);

    const entry: ClockifyTimeEntry = {
      ...baseEntry,
      customFieldValues: [{ customFieldId: 'status-field', name: 'Status', value: 'Z', timeEntryId: 'entry-1' }]
    };

    const rules: FormulaDefinition[] = [
      {
        id: 'status',
        workspaceId: 'workspace-1',
        fieldKey: 'Status',
        expr: '"Z"',
        priority: 1,
        onEvents: []
      }
    ];

    const result = engine.evaluate(rules, { timeEntry: entry }, 'TIME_ENTRY_UPDATED');

    expect(result.updates[0].value).toBe('A');
    expect(result.diagnostics[0].attemptedAutoFix).toBe(true);
  });

  it('extracts dependencies from CF references', () => {
    const deps = extractDependencies('ROUND(Duration.h * CF("Rate")) + CF("Other")');
    expect(deps).toContain('Rate');
    expect(deps).toContain('Other');
  });

  it('skips updates when computed value equals existing value', () => {
    const engine = new FormulaEngine(dictionaries);
    const entry: ClockifyTimeEntry = {
      ...baseEntry,
      customFieldValues: [
        { customFieldId: 'rate-field', name: 'Rate', value: 125, timeEntryId: 'entry-1' },
        { customFieldId: 'amount-field', name: 'Amount', value: 1187.5, timeEntryId: 'entry-1' }
      ]
    };

    const result = engine.evaluate([formulas[0]], { timeEntry: entry }, 'TIME_ENTRY_UPDATED');
    expect(result.updates).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('provides OT() helper shortcuts', () => {
    const engine = new FormulaEngine(dictionaries);
    const otSummary = {
      multiplier: 1.5,
      baseMultiplier: 1.5,
      flag: 'OT' as const,
      dailyHours: 12,
      entryHours: 4,
      restGapHours: 2,
      shortRest: true,
      previousEntryId: 'entry-0',
      timezoneOffsetMinutes: 0,
      dayKey: '2024-03-01@+0000',
      dayStartUtc: '2024-03-01T00:00:00.000Z',
      dayEndUtc: '2024-03-02T00:00:00.000Z'
    };

    const otFormulas: FormulaDefinition[] = [
      {
        id: 'ot-helper',
        workspaceId: 'workspace-1',
        fieldKey: 'Helper',
        expr: 'OT() + OT("base") - 1',
        priority: 30,
        onEvents: ['TIME_ENTRY_UPDATED']
      },
      {
        id: 'ot-label',
        workspaceId: 'workspace-1',
        fieldKey: 'Flag',
        expr: 'OTLABEL()',
        priority: 31,
        onEvents: ['TIME_ENTRY_UPDATED']
      }
    ];

    const entryWithOtFields: ClockifyTimeEntry = {
      ...baseEntry,
      customFieldValues: [
        ...baseEntry.customFieldValues,
        { customFieldId: 'helper-field', name: 'Helper', value: null, timeEntryId: 'entry-1' },
        { customFieldId: 'flag-field', name: 'Flag', value: null, timeEntryId: 'entry-1' }
      ]
    };

    const result = engine.evaluate(otFormulas, { timeEntry: entryWithOtFields, otSummary }, 'TIME_ENTRY_UPDATED');
    // OT() returns 1.5, OT("base") returns 1.5, so 1.5 + 1.5 - 1 = 2
    expect(result.updates[0].value).toBeCloseTo(2, 5);
    expect(result.updates[1].value).toBe('OT');
  });
});
