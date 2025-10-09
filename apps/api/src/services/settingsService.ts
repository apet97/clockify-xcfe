import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

// Schema for settings validation
export const settingsInputSchema = z.object({
  strict_mode: z.boolean().optional(),
  reference_months: z.number().int().min(1).max(12).optional(),
  region: z.string().optional()
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export type WorkspaceSettings = {
  workspace_id: string;
  strict_mode: boolean;
  reference_months: number;
  region?: string | null;
};

// Default settings derived from config
export const DEFAULT_SETTINGS: Omit<WorkspaceSettings, 'workspace_id'> = {
  strict_mode: false,
  reference_months: 3,
  region: CONFIG.CLOCKIFY_REGION || null
};

/**
 * Get workspace settings from database or return defaults if database is skipped
 */
export const getWorkspaceSettings = async (workspaceId: string): Promise<WorkspaceSettings> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug({ workspaceId }, 'Returning default settings (database skipped)');
    return {
      workspace_id: workspaceId,
      ...DEFAULT_SETTINGS
    };
  }

  const db = getDb();

  try {
    const { rows } = await db.query<WorkspaceSettings>(
      `SELECT workspace_id, strict_mode, backfill_months as reference_months, region
       FROM settings
       WHERE workspace_id = $1`,
      [workspaceId]
    );

    if (rows.length === 0) {
      logger.debug({ workspaceId }, 'No settings found, returning defaults');
      return {
        workspace_id: workspaceId,
        ...DEFAULT_SETTINGS
      };
    }

    return rows[0];
  } catch (error) {
    logger.error({ err: error, workspaceId }, 'Failed to fetch workspace settings');
    throw new Error('Failed to fetch workspace settings');
  }
};

/**
 * Update workspace settings in database
 */
export const updateWorkspaceSettings = async (
  workspaceId: string,
  patch: SettingsInput
): Promise<WorkspaceSettings> => {
  // Validate input
  const validated = settingsInputSchema.parse(patch);

  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug({ workspaceId, patch: validated }, 'Settings update skipped (database disabled)');
    return {
      workspace_id: workspaceId,
      ...DEFAULT_SETTINGS,
      ...validated
    };
  }

  const db = getDb();

  try {
    // Build the update query dynamically based on provided fields
    const updates: string[] = [];
    const values: unknown[] = [workspaceId];
    let paramIndex = 2;

    if (validated.strict_mode !== undefined) {
      updates.push(`strict_mode = $${paramIndex++}`);
      values.push(validated.strict_mode);
    }

    if (validated.reference_months !== undefined) {
      updates.push(`backfill_months = $${paramIndex++}`);
      values.push(validated.reference_months);
    }

    if (validated.region !== undefined) {
      updates.push(`region = $${paramIndex++}`);
      values.push(validated.region);
    }

    updates.push(`updated_at = NOW()`);

    // Use INSERT ... ON CONFLICT to upsert
    const { rows } = await db.query<WorkspaceSettings>(
      `INSERT INTO settings (workspace_id, strict_mode, backfill_months, region, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (workspace_id)
       DO UPDATE SET ${updates.join(', ')}
       RETURNING workspace_id, strict_mode, backfill_months as reference_months, region`,
      [
        workspaceId,
        validated.strict_mode ?? DEFAULT_SETTINGS.strict_mode,
        validated.reference_months ?? DEFAULT_SETTINGS.reference_months,
        validated.region ?? DEFAULT_SETTINGS.region
      ]
    );

    logger.info({ workspaceId, updates: validated }, 'Workspace settings updated');

    return rows[0];
  } catch (error) {
    logger.error({ err: error, workspaceId, patch: validated }, 'Failed to update workspace settings');
    throw new Error('Failed to update workspace settings');
  }
};
