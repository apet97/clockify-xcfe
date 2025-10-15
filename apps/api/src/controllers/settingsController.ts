import type { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { CONFIG } from '../config/index.js';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../services/settingsService.js';
import { logger } from '../lib/logger.js';
import { verifyClockifyJwt } from '../lib/jwt.js';

const formulaSchema = z.object({
  targetId: z.string().min(1),
  expr: z.string().min(1)
});

const settingsSchema = z.object({
  strict_mode: z.boolean().optional(),
  reference_months: z.number().int().min(1).max(12).optional(),
  region: z.string().optional(),
  formulas: z.array(formulaSchema).optional()
});

type Settings = z.infer<typeof settingsSchema>;

const extractAuthToken = (req: Request): string | null => {
  const authHeader = req.header('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  const token = req.query.auth_token;
  if (typeof token === 'string' && token.trim().length > 0) {
    return token.trim();
  }

  return null;
};

export const getSettings: RequestHandler = async (req, res) => {
  const authToken = extractAuthToken(req);

  if (!authToken) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  let claims: any;
  try {
    claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid JWT' });
  }

  const workspaceId = claims.workspaceId;

  try {
    const settings = await getWorkspaceSettings(workspaceId);

    // Return in the format the Admin UI expects
    res.json({
      strict_mode: settings.strict_mode,
      reference_months: settings.reference_months,
      region: settings.region || undefined,
      formulas: settings.formulas || []
    });
  } catch (error) {
    logger.error({ err: error, workspaceId }, 'Failed to fetch settings');
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  const authToken = extractAuthToken(req);

  if (!authToken) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  let claims: any;
  try {
    claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid JWT' });
  }

  const workspaceId = claims.workspaceId;

  // Validate request body with Zod
  const parseResult = settingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid settings payload',
      details: parseResult.error.errors
    });
  }

  const settings = parseResult.data;

  try {
    await updateWorkspaceSettings(workspaceId, settings);
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, workspaceId }, 'Failed to update settings');
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
