import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Pool, QueryResult } from 'pg';

// Mock the database and config modules
vi.mock('@api/lib/db.js', () => ({
  getDb: vi.fn()
}));

vi.mock('@api/config/index.js', () => ({
  CONFIG: {
    CLOCKIFY_REGION: 'use2',
    SKIP_DATABASE_CHECKS: false,
    WORKSPACE_ID: 'test-workspace'
  }
}));

const { getDb } = await import('@api/lib/db.js');
const { CONFIG } = await import('@api/config/index.js');
const {
  getWorkspaceSettings,
  updateWorkspaceSettings,
  DEFAULT_SETTINGS
} = await import('@api/services/settingsService.js');

describe('settingsService', () => {
  const mockQuery = vi.fn();
  const mockPool = { query: mockQuery } as unknown as Pool;

  beforeEach(() => {
    vi.mocked(getDb).mockReturnValue(mockPool);
    mockQuery.mockClear();
    // Reset CONFIG to default
    vi.mocked(CONFIG).SKIP_DATABASE_CHECKS = false;
    vi.mocked(CONFIG).CLOCKIFY_REGION = 'use2';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should derive from config', () => {
      expect(DEFAULT_SETTINGS).toEqual({
        strict_mode: false,
        reference_months: 3,
        region: 'use2'
      });
    });
  });

  describe('getWorkspaceSettings', () => {
    it('should return defaults when SKIP_DATABASE_CHECKS is true', async () => {
      vi.mocked(CONFIG).SKIP_DATABASE_CHECKS = true;

      const result = await getWorkspaceSettings('ws-1');

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: false,
        reference_months: 3,
        region: 'use2'
      });

      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should query database when settings exist', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            workspace_id: 'ws-1',
            strict_mode: true,
            reference_months: 6,
            region: 'euc1'
          }
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await getWorkspaceSettings('ws-1');

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: true,
        reference_months: 6,
        region: 'euc1'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT workspace_id, strict_mode, backfill_months as reference_months, region, formulas'),
        ['ws-1']
      );
    });

    it('should return defaults when no settings found', async () => {
      const mockResult: QueryResult = {
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await getWorkspaceSettings('ws-1');

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: false,
        reference_months: 3,
        region: 'use2'
      });
    });

    it('should throw error on database failure', async () => {
      mockQuery.mockRejectedValue(new Error('DB connection failed'));

      await expect(getWorkspaceSettings('ws-1')).rejects.toThrow('Failed to fetch workspace settings');
    });
  });

  describe('updateWorkspaceSettings', () => {
    it('should return merged settings when SKIP_DATABASE_CHECKS is true', async () => {
      vi.mocked(CONFIG).SKIP_DATABASE_CHECKS = true;

      const result = await updateWorkspaceSettings('ws-1', {
        strict_mode: true,
        reference_months: 6
      });

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: true,
        reference_months: 6,
        region: 'use2'
      });

      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should issue INSERT ON CONFLICT DO UPDATE with all fields', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            workspace_id: 'ws-1',
            strict_mode: true,
            reference_months: 8,
            region: 'euw2'
          }
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await updateWorkspaceSettings('ws-1', {
        strict_mode: true,
        reference_months: 8,
        region: 'euw2'
      });

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: true,
        reference_months: 8,
        region: 'euw2'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO settings'),
        ['ws-1', true, 8, 'euw2', null, true, 8, 'euw2']
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (workspace_id)'),
        expect.anything()
      );
    });

    it('should handle partial updates', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            workspace_id: 'ws-1',
            strict_mode: true,
            reference_months: 3,
            region: 'use2'
          }
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await updateWorkspaceSettings('ws-1', {
        strict_mode: true
      });

      expect(result.strict_mode).toBe(true);

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should validate input with zod', async () => {
      await expect(
        updateWorkspaceSettings('ws-1', {
          reference_months: 15 as any // Invalid: > 12
        })
      ).rejects.toThrow();

      await expect(
        updateWorkspaceSettings('ws-1', {
          reference_months: 0 as any // Invalid: < 1
        })
      ).rejects.toThrow();
    });

    it('should throw error on database failure', async () => {
      mockQuery.mockRejectedValue(new Error('DB write failed'));

      await expect(
        updateWorkspaceSettings('ws-1', { strict_mode: true })
      ).rejects.toThrow('Failed to update workspace settings');
    });
  });

  describe('lifecycle integration', () => {
    it('should persist structured settings from Clockify', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            workspace_id: 'ws-1',
            strict_mode: true,
            reference_months: 4,
            region: 'euc1'
          }
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValue(mockResult);

      // Simulate Clockify sending structured settings
      const clockifySettings = {
        strict_mode: true,
        reference_months: 4,
        region: 'euc1',
        some_other_field: 'ignored' // Should be filtered out
      };

      const settingsPatch: {
        strict_mode?: boolean;
        reference_months?: number;
        region?: string;
      } = {};

      if (typeof clockifySettings.strict_mode === 'boolean') {
        settingsPatch.strict_mode = clockifySettings.strict_mode;
      }

      if (typeof clockifySettings.reference_months === 'number') {
        settingsPatch.reference_months = clockifySettings.reference_months;
      }

      if (typeof clockifySettings.region === 'string') {
        settingsPatch.region = clockifySettings.region;
      }

      const result = await updateWorkspaceSettings('ws-1', settingsPatch);

      expect(result).toEqual({
        workspace_id: 'ws-1',
        strict_mode: true,
        reference_months: 4,
        region: 'euc1'
      });

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should skip update when no relevant keys present', async () => {
      vi.mocked(CONFIG).SKIP_DATABASE_CHECKS = false;

      const clockifySettings = {
        some_random_field: 'value',
        another_field: 123
      };

      const settingsPatch: {
        strict_mode?: boolean;
        reference_months?: number;
        region?: string;
      } = {};

      if (typeof clockifySettings.strict_mode === 'boolean') {
        settingsPatch.strict_mode = clockifySettings.strict_mode;
      }

      // No relevant keys, so Object.keys(settingsPatch).length === 0
      expect(Object.keys(settingsPatch).length).toBe(0);

      // In the actual controller, we would skip the updateWorkspaceSettings call
      // Here we just verify the filtering logic works
    });
  });
});
