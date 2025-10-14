import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

// Schema for settings validation
export const settingsInputSchema = z.object({
  strict_mode: z.boolean().optional(),
  reference_months: z.number().int().min(1).max(12).optional(),
  region: z.string().optional(),
  formulas: z.array(z.object({
    targetId: z.string().min(1),
    expr: z.string().min(1)
  })).optional()
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export type WorkspaceSettings = {
  workspace_id: string;
  strict_mode: boolean;
  reference_months: number;
  region?: string | null;
  formulas?: Array<{ targetId: string; expr: string }>;
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
      `SELECT workspace_id, strict_mode, backfill_months as reference_months, region, formulas
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
    let paramIndex = 6; // Start after INSERT parameters ($1-$5)

    if (validated.strict_mode !== undefined) {
      updates.push(`strict_mode = $${paramIndex++}`);
    }

    if (validated.reference_months !== undefined) {
      updates.push(`backfill_months = $${paramIndex++}`);
    }

    if (validated.region !== undefined) {
      updates.push(`region = $${paramIndex++}`);
    }

    if (validated.formulas !== undefined) {
      updates.push(`formulas = $${paramIndex++}`);
    }

    updates.push(`updated_at = NOW()`);

    // Build values array with INSERT params first, then UPDATE params
    const values: unknown[] = [
      workspaceId, // $1
      validated.strict_mode ?? DEFAULT_SETTINGS.strict_mode, // $2
      validated.reference_months ?? DEFAULT_SETTINGS.reference_months, // $3
      validated.region ?? DEFAULT_SETTINGS.region, // $4
      validated.formulas ? JSON.stringify(validated.formulas) : null, // $5
    ];

    // Add UPDATE parameters (only for fields that are being updated)
    if (validated.strict_mode !== undefined) {
      values.push(validated.strict_mode);
    }
    if (validated.reference_months !== undefined) {
      values.push(validated.reference_months);
    }
    if (validated.region !== undefined) {
      values.push(validated.region);
    }
    if (validated.formulas !== undefined) {
      values.push(JSON.stringify(validated.formulas));
    }

    // Use INSERT ... ON CONFLICT to upsert
    const { rows } = await db.query<WorkspaceSettings>(
      `INSERT INTO settings (workspace_id, strict_mode, backfill_months, region, formulas, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (workspace_id)
       DO UPDATE SET ${updates.join(', ')}
       RETURNING workspace_id, strict_mode, backfill_months as reference_months, region, formulas`,
      values
    );

    logger.info({ workspaceId, updates: validated }, 'Workspace settings updated');

    return rows[0];
  } catch (error) {
    logger.error({ err: error, workspaceId, patch: validated }, 'Failed to update workspace settings');
    throw new Error('Failed to update workspace settings');
  }
};
