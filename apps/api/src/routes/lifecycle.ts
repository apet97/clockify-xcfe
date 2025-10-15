import { Router, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '../lib/logger.js';
import { verifyClockifyJwt, type ClockifyJwtClaims } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';
import { rememberInstallation, forgetInstallation } from '../services/installMemory.js';

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
    const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
    // In dev, allow proceeding without token to cache installation
    let claims: ClockifyJwtClaims | null = null;
    if (token) {
      try {
        claims = await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false);
      } catch (e) {
        if (!CONFIG.DEV_ALLOW_UNSIGNED) {
          throw e;
        }
        // Continue unsigned in dev
      }
    } else if (!CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }
    
    // Validate the installation payload
    const installationData = InstallationPayloadSchema.parse(req.body);
    
    logger.info('Add-on installed', {
      addonId: installationData.addonId,
      workspaceId: installationData.workspaceId,
      userId: installationData.asUser,
      correlationId: req.correlationId
    });

    // Store the installation token
    // In production, persist to DB; in dev/no-DB, keep in memory for API calls
    logger.info('Installation token received', {
      addonId: installationData.addonId,
      workspaceId: installationData.workspaceId,
      hasAuthToken: !!installationData.authToken
    });

    // Cache token in-memory to enable outbound API calls without manual API keys
    if (installationData.authToken) {
      const backendUrl = (claims as any)?.backendUrl || installationData.apiurl;
      rememberInstallation(installationData.workspaceId, installationData.authToken, backendUrl);
    }

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

    // Persist minimal install capture for tooling (no secrets)
    try {
      const stateDir = path.resolve(process.cwd(), '.state');
      fs.mkdirSync(stateDir, { recursive: true });
      const statePath = path.join(stateDir, 'install.json');
      const payload = {
        addonId: installationData.addonId,
        workspaceId: installationData.workspaceId,
        apiurl: installationData.apiurl,
        hasAuthToken: !!installationData.authToken,
        installedAt: new Date().toISOString()
      };
      fs.writeFileSync(statePath, JSON.stringify(payload, null, 2));
    } catch {}

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Installation lifecycle error', { error, correlationId: req.correlationId });
    if (CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(200).json({ ok: true, route: 'installed', devUnsigned: true });
    }
    res.status(400).json({ error: 'Invalid installation payload' });
  }
});

// Liveness probe (GET) for platform validation
router.get('/installed', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'installed' });
});

/**
 * Status changed lifecycle hook
 * Called when add-on is enabled/disabled
 */
router.post('/status-changed', async (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
    if (!token) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'status-changed', devUnsigned: true });
      }
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    try {
      await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false);
    } catch (e) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'status-changed', devUnsigned: true });
      }
      throw e;
    }
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
    if (CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(200).json({ ok: true, route: 'status-changed', devUnsigned: true });
    }
    res.status(400).json({ error: 'Invalid status change payload' });
  }
});

router.get('/status-changed', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'status-changed' });
});

/**
 * Settings updated lifecycle hook
 * Called when add-on settings are updated
 */
router.post('/settings-updated', async (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
    if (!token) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'settings-updated', devUnsigned: true });
      }
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    try {
      await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false);
    } catch (e) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'settings-updated', devUnsigned: true });
      }
      throw e;
    }
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
    if (CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(200).json({ ok: true, route: 'settings-updated', devUnsigned: true });
    }
    res.status(400).json({ error: 'Invalid settings update payload' });
  }
});

router.get('/settings-updated', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'settings-updated' });
});

/**
 * Updated lifecycle hook
 * Called when add-on is updated to a new version
 */
router.post('/updated', async (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
    if (!token) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'updated', devUnsigned: true });
      }
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    let claims: ClockifyJwtClaims | null = null;
    try {
      claims = await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false);
    } catch (e) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'updated', devUnsigned: true });
      }
      throw e;
    }
    
    logger.info('Add-on updated', {
      addonId: claims.addonId,
      workspaceId: claims.workspaceId,
      correlationId: req.correlationId
    });

    // Handle update logic here (migrations, cache clearing, etc.)
    logger.info('Add-on update completed successfully');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Updated lifecycle error', { error, correlationId: req.correlationId });
    if (CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(200).json({ ok: true, route: 'updated', devUnsigned: true });
    }
    res.status(400).json({ error: 'Invalid update payload' });
  }
});

router.get('/updated', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'updated' });
});

/**
 * Uninstalled lifecycle hook
 * Called when add-on is uninstalled from workspace
 */
router.post('/uninstalled', async (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-addon-lifecycle-token'] as string) || (req.headers['clockify-signature'] as string);
    if (!token) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'uninstalled', devUnsigned: true });
      }
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    try {
      await verifyClockifyJwt(token, CONFIG.ADDON_KEY, false);
    } catch (e) {
      if (CONFIG.DEV_ALLOW_UNSIGNED) {
        return res.status(200).json({ ok: true, route: 'uninstalled', devUnsigned: true });
      }
      throw e;
    }
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

    // Remove cached token
    forgetInstallation(deletedData.workspaceId);

    // Mark local state as revoked for tooling
    try {
      const stateDir = path.resolve(process.cwd(), '.state');
      const statePath = path.join(stateDir, 'install.json');
      if (fs.existsSync(statePath)) {
        const cur = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        cur.revokedAt = new Date().toISOString();
        fs.writeFileSync(statePath, JSON.stringify(cur, null, 2));
      }
    } catch {}
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Uninstalled lifecycle error', { error, correlationId: req.correlationId });
    if (CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(200).json({ ok: true, route: 'uninstalled', devUnsigned: true });
    }
    res.status(400).json({ error: 'Invalid uninstall payload' });
  }
});

router.get('/uninstalled', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'uninstalled' });
});

export default router;
