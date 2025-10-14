import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { logger } from '../lib/logger.js';
import { verifyClockifyJwt, type InstallationTokenPayload, type UserTokenPayload } from '../lib/clockifyJwt.js';
import { CONFIG } from '../config/index.js';

const router: Router = Router();

// Schema for installation payload
const InstallationPayloadSchema = z.object({
  addonId: z.string(),
  authToken: z.string(),
  workspaceId: z.string(),
  asUser: z.string(),
  apiurl: z.string(),
  addonUserId: z.string(),
  webhooks: z.array(z.object({
    path: z.string(),
    webhookType: z.string(),
    authToken: z.string()
  })).optional()
});

// Schema for status changed payload
const StatusChangedPayloadSchema = z.object({
  addonId: z.string(),
  workspaceId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

// Schema for settings updated payload
const SettingsUpdatedPayloadSchema = z.object({
  workspaceId: z.string(),
  addonId: z.string(),
  settings: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  }))
});

// Schema for deleted payload
const DeletedPayloadSchema = z.object({
  addonId: z.string(),
  workspaceId: z.string(),
  asUser: z.string()
});

/**
 * Installation lifecycle hook
 * Called when add-on is installed on a workspace
 */
router.post('/installed', async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    // Verify the lifecycle token
    const payload = verifyClockifyJwt(token, CONFIG.ADDON_KEY, 'installation') as InstallationTokenPayload;
    
    // Validate the installation payload
    const installationData = InstallationPayloadSchema.parse(req.body);
    
    logger.info('Add-on installed', {
      addonId: installationData.addonId,
      workspaceId: installationData.workspaceId,
      userId: installationData.asUser,
      correlationId: req.correlationId
    });

    // Store the installation token securely
    // In production, store this in a secure database or secret manager
    logger.info('Installation token received', {
      addonId: installationData.addonId,
      workspaceId: installationData.workspaceId,
      hasAuthToken: !!installationData.authToken
    });

    // Store webhook tokens if provided
    if (installationData.webhooks) {
      for (const webhook of installationData.webhooks) {
        logger.info('Webhook registered', {
          path: webhook.path,
          type: webhook.webhookType,
          hasAuthToken: !!webhook.authToken
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Installation lifecycle error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid installation payload' });
  }
});

/**
 * Status changed lifecycle hook
 * Called when add-on is enabled/disabled
 */
router.post('/status-changed', async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const payload = verifyClockifyJwt(token, CONFIG.ADDON_KEY, 'installation');
    const statusData = StatusChangedPayloadSchema.parse(req.body);
    
    logger.info('Add-on status changed', {
      addonId: statusData.addonId,
      workspaceId: statusData.workspaceId,
      status: statusData.status,
      correlationId: req.correlationId
    });

    // Handle status change logic here
    if (statusData.status === 'INACTIVE') {
      // Pause any background processes
      logger.info('Add-on deactivated, pausing background processes');
    } else if (statusData.status === 'ACTIVE') {
      // Resume background processes
      logger.info('Add-on activated, resuming background processes');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Status changed lifecycle error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid status change payload' });
  }
});

/**
 * Settings updated lifecycle hook
 * Called when add-on settings are updated
 */
router.post('/settings-updated', async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const payload = verifyClockifyJwt(token, CONFIG.ADDON_KEY, 'installation');
    const settingsData = SettingsUpdatedPayloadSchema.parse(req.body);
    
    logger.info('Add-on settings updated', {
      addonId: settingsData.addonId,
      workspaceId: settingsData.workspaceId,
      settingsCount: settingsData.settings.length,
      correlationId: req.correlationId
    });

    // Process settings updates
    for (const setting of settingsData.settings) {
      logger.debug('Setting updated', {
        id: setting.id,
        name: setting.name,
        value: setting.value
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Settings updated lifecycle error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid settings update payload' });
  }
});

/**
 * Updated lifecycle hook
 * Called when add-on is updated to a new version
 */
router.post('/updated', async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const payload = verifyClockifyJwt(token, CONFIG.ADDON_KEY, 'installation');
    
    logger.info('Add-on updated', {
      addonId: payload.addonId,
      workspaceId: payload.workspaceId,
      correlationId: req.correlationId
    });

    // Handle update logic here (migrations, cache clearing, etc.)
    logger.info('Add-on update completed successfully');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Updated lifecycle error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid update payload' });
  }
});

/**
 * Uninstalled lifecycle hook
 * Called when add-on is uninstalled from workspace
 */
router.post('/uninstalled', async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const payload = verifyClockifyJwt(token, CONFIG.ADDON_KEY, 'installation');
    const deletedData = DeletedPayloadSchema.parse(req.body);
    
    logger.info('Add-on uninstalled', {
      addonId: deletedData.addonId,
      workspaceId: deletedData.workspaceId,
      userId: deletedData.asUser,
      correlationId: req.correlationId
    });

    // Clean up workspace data
    logger.info('Cleaning up workspace data', {
      workspaceId: deletedData.workspaceId
    });

    // In production, clean up:
    // - Remove formulas and dictionaries
    // - Clear cached data
    // - Remove webhook subscriptions
    // - Archive audit logs

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Uninstalled lifecycle error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid uninstall payload' });
  }
});

export default router;