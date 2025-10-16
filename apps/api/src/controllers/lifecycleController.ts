import type { RequestHandler } from 'express';
import { z } from 'zod';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { upsertInstallation, deleteInstallation } from '../services/installationService.js';
import { updateWorkspaceSettings } from '../services/settingsService.js';
import { storeWebhookToken, clearWebhookTokens } from '../lib/webhookSecurity.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { recordLifecycleEvent } from '../lib/lifecycleTracker.js';

class LifecycleAuthError extends Error {}

const verifyLifecycleToken = async (token: string) => {
  try {
    return await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false); // Don't require backendUrl for lifecycle tokens
  } catch (error) {
    throw new LifecycleAuthError(
      `Lifecycle token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

const getLifecycleClaims = async (req: any) => {
  const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
  
  // Allow bypassing token verification in development mode
  if (CONFIG.DEV_ALLOW_UNSIGNED && !token) {
    return {
      addonId: 'dev-addon-id',
      workspaceId: 'dev-workspace-id',
      userId: 'dev-user-id',
      sub: CONFIG.ADDON_KEY
    } as any;
  }

  if (!token) {
    throw new LifecycleAuthError('Missing lifecycle token');
  }

  return await verifyLifecycleToken(token);
};

export const handleInstalled: RequestHandler = async (req, res) => {
  let claims;
  try {
    claims = await getLifecycleClaims(req);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId, authToken, webhookTokens } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required installation data' });
  }

  // Store webhook-specific tokens from installation payload (per Clockify Add-on Guide)
  // These tokens are used to verify incoming webhook requests
  if (webhookTokens && typeof webhookTokens === 'object') {
    let tokenCount = 0;
    for (const [eventType, token] of Object.entries(webhookTokens)) {
      if (typeof token === 'string') {
        storeWebhookToken(workspaceId, eventType, token);
        tokenCount++;
      }
    }
    logger.info(
      { workspaceId, addonId, webhookTokenCount: tokenCount },
      'Stored webhook tokens from installation'
    );
  }

  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.info({ addonId, workspaceId, userId: claims.userId }, 'Add-on installed (storage skipped)');
    return res.status(200).json({ success: true, storage: 'skipped' });
  }

  try {
    await upsertInstallation({
      addonId,
      workspaceId,
      installationToken: authToken,
      status: 'ACTIVE'
    });
  } catch (error) {
    logger.error({ err: error }, 'Installation persistence failed');
    return res.status(503).json({ error: 'Failed to persist installation' });
  }

  logger.info({ addonId, workspaceId, userId: claims.userId }, 'Add-on installed successfully');

  recordLifecycleEvent('INSTALLED', addonId, workspaceId);

  res.status(200).json({ success: true });
};

export const handleStatusChanged: RequestHandler = async (req, res) => {
  let claims;
  try {
    claims = await getLifecycleClaims(req);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId, status } = req.body;

  if (!addonId || !workspaceId || !status) {
    return res.status(400).json({ error: 'Missing required status data' });
  }

  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.info({ addonId, workspaceId, status, userId: claims.userId }, 'Add-on status changed (storage skipped)');
    return res.status(200).json({ success: true, storage: 'skipped' });
  }

  try {
    await upsertInstallation({
      addonId,
      workspaceId,
      status
    });
  } catch (error) {
    logger.error({ err: error }, 'Status change persistence failed');
    return res.status(503).json({ error: 'Failed to update installation status' });
  }

  logger.info({ addonId, workspaceId, status, userId: claims.userId }, 'Add-on status changed');

  recordLifecycleEvent('STATUS_CHANGED', addonId, workspaceId);

  res.status(200).json({ success: true });
};

const settingsPayloadSchema = z.object({
  addonId: z.string().min(1, 'addonId is required'),
  workspaceId: z.string().min(1, 'workspaceId is required'),
  settings: z.record(z.any()).optional()
});

export const handleSettingsUpdated: RequestHandler = async (req, res) => {
  let claims;
  try {
    claims = await getLifecycleClaims(req);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid lifecycle token' });
  }

  let validated;
  try {
    validated = settingsPayloadSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'invalid_settings_payload',
        details: error.errors
      });
    }
    return res.status(400).json({ error: 'Invalid settings payload' });
  }

  const { addonId, workspaceId, settings } = validated;

  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.info(
      {
        addonId,
        workspaceId,
        settingsKeys: settings ? Object.keys(settings) : [],
        userId: claims.userId
      },
      'Add-on settings updated (storage skipped)'
    );
    return res.status(200).json({ success: true, storage: 'skipped' });
  }

  try {
    // Store raw settings blob in installations table
    await upsertInstallation({
      addonId,
      workspaceId,
      settingsJson: settings || {}
    });

    // Mirror relevant keys to the canonical settings table
    if (settings && typeof settings === 'object') {
      const settingsPatch: {
        strict_mode?: boolean;
        reference_months?: number;
        region?: string;
      } = {};

      if (typeof settings.strict_mode === 'boolean') {
        settingsPatch.strict_mode = settings.strict_mode;
      }

      if (typeof settings.reference_months === 'number') {
        settingsPatch.reference_months = settings.reference_months;
      }

      if (typeof settings.region === 'string') {
        settingsPatch.region = settings.region;
      }

      // Only update settings table if we have relevant keys
      if (Object.keys(settingsPatch).length > 0) {
        await updateWorkspaceSettings(workspaceId, settingsPatch);
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Settings update persistence failed');
    return res.status(503).json({ error: 'Failed to persist settings' });
  }

  logger.info(
    {
      addonId,
      workspaceId,
      settingsKeys: settings ? Object.keys(settings) : [],
      userId: claims.userId
    },
    'Add-on settings updated'
  );

  recordLifecycleEvent('SETTINGS_UPDATED', addonId, workspaceId);

  res.status(200).json({ success: true });
};

export const handleDeleted: RequestHandler = async (req, res) => {
  let claims;
  try {
    claims = await getLifecycleClaims(req);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required deletion data' });
  }

  // Clear all webhook tokens for this workspace
  clearWebhookTokens(workspaceId);
  logger.info({ workspaceId, addonId }, 'Cleared webhook tokens for uninstalled addon');

  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.info({ addonId, workspaceId, userId: claims.userId }, 'Add-on deleted (storage skipped)');
    return res.status(200).json({ success: true, storage: 'skipped' });
  }

  try {
    await deleteInstallation(addonId, workspaceId);
  } catch (error) {
    logger.error({ err: error }, 'Deletion persistence failed');
    return res.status(503).json({ error: 'Failed to delete installation' });
  }

  logger.info({ addonId, workspaceId, userId: claims.userId }, 'Add-on deleted successfully');

  recordLifecycleEvent('DELETED', addonId, workspaceId);

  res.status(200).json({ success: true });
};
