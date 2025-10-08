import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { upsertInstallation, deleteInstallation } from '../services/installationService.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

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

export const handleInstalled: RequestHandler = async (req, res) => {
  const token = req.headers['x-addon-lifecycle-token'] as string;
  if (!token) {
    return res.status(401).json({ error: 'Missing lifecycle token' });
  }

  let claims;
  try {
    claims = await verifyLifecycleToken(token);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId, authToken } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required installation data' });
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

  res.status(200).json({ success: true });
};

export const handleStatusChanged: RequestHandler = async (req, res) => {
  const token = req.headers['x-addon-lifecycle-token'] as string;
  if (!token) {
    return res.status(401).json({ error: 'Missing lifecycle token' });
  }

  let claims;
  try {
    claims = await verifyLifecycleToken(token);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: 'Invalid lifecycle token' });
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

  res.status(200).json({ success: true });
};

export const handleSettingsUpdated: RequestHandler = async (req, res) => {
  const token = req.headers['x-addon-lifecycle-token'] as string;
  if (!token) {
    return res.status(401).json({ error: 'Missing lifecycle token' });
  }

  let claims;
  try {
    claims = await verifyLifecycleToken(token);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId, settings } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required settings data' });
  }

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
    await upsertInstallation({
      addonId,
      workspaceId,
      settingsJson: settings || {}
    });
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

  res.status(200).json({ success: true });
};

export const handleDeleted: RequestHandler = async (req, res) => {
  const token = req.headers['x-addon-lifecycle-token'] as string;
  if (!token) {
    return res.status(401).json({ error: 'Missing lifecycle token' });
  }

  let claims;
  try {
    claims = await verifyLifecycleToken(token);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required deletion data' });
  }

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

  res.status(200).json({ success: true });
};