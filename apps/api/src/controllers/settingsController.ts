import type { RequestHandler } from 'express';
import { z } from 'zod';
import { CONFIG } from '../config/index.js';
import { getWorkspaceSettings, updateWorkspaceSettings, settingsInputSchema } from '../services/settingsService.js';
import { logger } from '../lib/logger.js';

const settingsSchema = z.object({
  strict_mode: z.boolean(),
  reference_months: z.number().int().min(1).max(12),
  region: z.string().optional()
});

type Settings = z.infer<typeof settingsSchema>;

export const getSettings: RequestHandler = async (req, res) => {
  const workspaceId = req.query.workspaceId as string || CONFIG.WORKSPACE_ID;

  try {
    const settings = await getWorkspaceSettings(workspaceId);

    // Return in the format the Admin UI expects
    res.json({
      strict_mode: settings.strict_mode,
      reference_months: settings.reference_months,
      region: settings.region || undefined
    });
  } catch (error) {
    logger.error({ err: error, workspaceId }, 'Failed to fetch settings');
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  const workspaceId = req.query.workspaceId as string || CONFIG.WORKSPACE_ID;

  try {
    const settings = settingsSchema.parse(req.body);

    const updated = await updateWorkspaceSettings(workspaceId, settings);

    // Return in the format the Admin UI expects
    res.json({
      strict_mode: updated.strict_mode,
      reference_months: updated.reference_months,
      region: updated.region || undefined
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid settings data', details: error.errors });
    }

    logger.error({ err: error, workspaceId }, 'Failed to update settings');
    res.status(500).json({ error: 'Failed to update settings' });
  }
};