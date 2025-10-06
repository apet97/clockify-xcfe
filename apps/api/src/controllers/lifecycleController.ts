import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { upsertInstallation, deleteInstallation } from '../services/installationService.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

const verifyLifecycleToken = async (token: string) => {
  try {
    return await verifyClockifyJwt(token, CONFIG.ADDON_KEY);
  } catch (error) {
    throw new Error(`Lifecycle token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const handleInstalled: RequestHandler = async (req, res) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const claims = await verifyLifecycleToken(token);
    
    // Extract installation data from request body
    const { addonId, workspaceId, authToken } = req.body;
    
    if (!addonId || !workspaceId) {
      return res.status(400).json({ error: 'Missing required installation data' });
    }

    // Store installation
    await upsertInstallation({
      addonId,
      workspaceId,
      installationToken: authToken,
      status: 'ACTIVE'
    });

    logger.info({ 
      addonId, 
      workspaceId,
      userId: claims.userId 
    }, 'Add-on installed successfully');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Installation handler failed');
    res.status(401).json({ error: 'Invalid lifecycle token' });
  }
};

export const handleStatusChanged: RequestHandler = async (req, res) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const claims = await verifyLifecycleToken(token);
    
    const { addonId, workspaceId, status } = req.body;
    
    if (!addonId || !workspaceId || !status) {
      return res.status(400).json({ error: 'Missing required status data' });
    }

    // Update installation status
    await upsertInstallation({
      addonId,
      workspaceId,
      status
    });

    logger.info({ 
      addonId, 
      workspaceId, 
      status,
      userId: claims.userId 
    }, 'Add-on status changed');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Status change handler failed');
    res.status(401).json({ error: 'Invalid lifecycle token' });
  }
};

export const handleSettingsUpdated: RequestHandler = async (req, res) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const claims = await verifyLifecycleToken(token);
    
    const { addonId, workspaceId, settings } = req.body;
    
    if (!addonId || !workspaceId) {
      return res.status(400).json({ error: 'Missing required settings data' });
    }

    // Update installation settings
    await upsertInstallation({
      addonId,
      workspaceId,
      settingsJson: settings || {}
    });

    logger.info({ 
      addonId, 
      workspaceId,
      settingsKeys: settings ? Object.keys(settings) : [],
      userId: claims.userId 
    }, 'Add-on settings updated');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Settings update handler failed');
    res.status(401).json({ error: 'Invalid lifecycle token' });
  }
};

export const handleDeleted: RequestHandler = async (req, res) => {
  try {
    const token = req.headers['x-addon-lifecycle-token'] as string;
    if (!token) {
      return res.status(401).json({ error: 'Missing lifecycle token' });
    }

    const claims = await verifyLifecycleToken(token);
    
    const { addonId, workspaceId } = req.body;
    
    if (!addonId || !workspaceId) {
      return res.status(400).json({ error: 'Missing required deletion data' });
    }

    // Delete installation and all related data
    await deleteInstallation(addonId, workspaceId);

    logger.info({ 
      addonId, 
      workspaceId,
      userId: claims.userId 
    }, 'Add-on deleted successfully');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Deletion handler failed');
    res.status(401).json({ error: 'Invalid lifecycle token' });
  }
};