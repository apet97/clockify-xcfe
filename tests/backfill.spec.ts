import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runBackfill } from '@api/services/backfillService.js';
import { clockifyClient, RateLimitError } from '@api/lib/clockifyClient.js';
import { fetchFormulaEngineInputs } from '@api/services/formulaService.js';
import { recordRun } from '@api/services/runService.js';
import { FormulaEngine } from '@api/lib/formulaEngine.js';

// Mock dependencies
vi.mock('@api/lib/clockifyClient.js');
vi.mock('@api/services/formulaService.js');
vi.mock('@api/services/runService.js');
vi.mock('@api/lib/formulaEngine.js');
vi.mock('@api/config/index.js', () => ({
  CONFIG: {
    WORKSPACE_ID: 'test-workspace'
  }
}));

const mockClockifyClient = vi.mocked(clockifyClient);
const mockFetchFormulaEngineInputs = vi.mocked(fetchFormulaEngineInputs);
const mockRecordRun = vi.mocked(recordRun);
const MockFormulaEngine = vi.mocked(FormulaEngine);

describe('runBackfill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockFetchFormulaEngineInputs.mockResolvedValue({
      formulas: [{ id: 'test-formula', expression: 'CF("Amount") = 100' }],
      dictionaries: {}
    });
    
    const mockEngine = {
      evaluate: vi.fn().mockReturnValue({ updates: [] })
    };
    MockFormulaEngine.mockImplementation(() => mockEngine as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle rate limiting with retry during reports API call', async () => {
    vi.useFakeTimers();
    
    // Mock rate limit error on first call, success on second
    const rateLimitError = new RateLimitError('Rate limited', 1000);
    mockClockifyClient.getDetailedReport
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        timeEntries: [{ id: 'entry-1' }],
        totals: []
      });

    // Mock time entry fetch
    mockClockifyClient.getTimeEntry.mockResolvedValue({
      id: 'entry-1',
      userId: 'user-1',
      customFieldValues: []
    } as any);

    const backfillPromise = runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T23:59:59Z',
      dryRun: true
    });

    // Advance timers to simulate retry delay
    await vi.advanceTimersByTimeAsync(1000);

    const result = await backfillPromise;

    expect(result.scanned).toBe(1);
    expect(mockClockifyClient.getDetailedReport).toHaveBeenCalledTimes(2);
  });

  it('should handle rate limiting during PATCH operations', async () => {
    vi.useFakeTimers();
    
    mockClockifyClient.getDetailedReport.mockResolvedValue({
      timeEntries: [{ id: 'entry-1' }],
      totals: []
    });

    mockClockifyClient.getTimeEntry.mockResolvedValue({
      id: 'entry-1',
      userId: 'user-1',
      customFieldValues: []
    } as any);

    // Mock formula evaluation to return updates
    const mockEngine = MockFormulaEngine.mock.instances[0] as any;
    mockEngine.evaluate.mockReturnValue({
      updates: [{ customFieldId: 'field-1', value: 100 }]
    });

    // Mock rate limit error on PATCH, then success
    const rateLimitError = new RateLimitError('Rate limited', 500);
    mockClockifyClient.patchTimeEntryCustomFields
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(undefined);

    mockRecordRun.mockResolvedValue(undefined);

    const backfillPromise = runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T23:59:59Z',
      dryRun: false
    });

    // Advance timers to simulate retry delay
    await vi.advanceTimersByTimeAsync(500);

    const result = await backfillPromise;

    expect(result.updated).toBe(1);
    expect(mockClockifyClient.patchTimeEntryCustomFields).toHaveBeenCalledTimes(2);
    expect(mockRecordRun).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: 'entry-1',
        status: 'success'
      })
    );
  });

  it('should process large day with pagination', async () => {
    // Mock multiple pages of results
    mockClockifyClient.getDetailedReport
      .mockResolvedValueOnce({
        timeEntries: Array.from({ length: 200 }, (_, i) => ({ id: `entry-${i}` })),
        totals: []
      })
      .mockResolvedValueOnce({
        timeEntries: Array.from({ length: 50 }, (_, i) => ({ id: `entry-${i + 200}` })),
        totals: []
      });

    // Mock time entry fetches
    mockClockifyClient.getTimeEntry.mockResolvedValue({
      id: 'test-entry',
      userId: 'user-1',
      customFieldValues: []
    } as any);

    const result = await runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T23:59:59Z',
      dryRun: true
    });

    expect(result.scanned).toBe(250);
    expect(mockClockifyClient.getDetailedReport).toHaveBeenCalledTimes(2);
    expect(result.dayResults).toHaveLength(1);
    expect(result.dayResults[0].date).toBe('2024-01-01');
    expect(result.dayResults[0].entries).toBe(250);
  });

  it('should handle multiple days', async () => {
    mockClockifyClient.getDetailedReport.mockResolvedValue({
      timeEntries: [{ id: 'entry-1' }],
      totals: []
    });

    mockClockifyClient.getTimeEntry.mockResolvedValue({
      id: 'entry-1',
      userId: 'user-1',
      customFieldValues: []
    } as any);

    const result = await runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-03T23:59:59Z',
      dryRun: true
    });

    expect(result.dayResults).toHaveLength(3);
    expect(result.dayResults.map(d => d.date)).toEqual([
      '2024-01-01',
      '2024-01-02', 
      '2024-01-03'
    ]);
    expect(mockClockifyClient.getDetailedReport).toHaveBeenCalledTimes(3);
  });

  it('should handle dry run mode correctly', async () => {
    mockClockifyClient.getDetailedReport.mockResolvedValue({
      timeEntries: [{ id: 'entry-1' }],
      totals: []
    });

    mockClockifyClient.getTimeEntry.mockResolvedValue({
      id: 'entry-1',
      userId: 'user-1',
      customFieldValues: []
    } as any);

    // Mock formula evaluation to return updates
    const mockEngine = MockFormulaEngine.mock.instances[0] as any;
    mockEngine.evaluate.mockReturnValue({
      updates: [{ customFieldId: 'field-1', value: 100 }]
    });

    const result = await runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T23:59:59Z',
      dryRun: true
    });

    expect(result.dryRun).toBe(true);
    expect(result.updated).toBe(1);
    expect(mockClockifyClient.patchTimeEntryCustomFields).not.toHaveBeenCalled();
    expect(mockRecordRun).not.toHaveBeenCalled();
  });

  it('should record errors for failed entries', async () => {
    mockClockifyClient.getDetailedReport.mockResolvedValue({
      timeEntries: [{ id: 'entry-1' }],
      totals: []
    });

    // Mock time entry fetch to fail
    mockClockifyClient.getTimeEntry.mockRejectedValue(new Error('Network error'));

    const result = await runBackfill({
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T23:59:59Z',
      dryRun: false
    });

    expect(result.scanned).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.outcomes[0].error).toBe('Network error');
    expect(mockRecordRun).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: 'entry-1',
        status: 'error'
      })
    );
  });
});