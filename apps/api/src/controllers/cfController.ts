import type { Request, Response } from 'express';
import { z } from 'zod';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { clockifyClient } from '../lib/clockifyClient.js';
import { logger } from '../lib/logger.js';
import { getInstallation } from '../services/installationService.js';
import { CONFIG } from '../config/index.js';

/**
 * GET /v1/cf/fields
 * Lists custom fields for the workspace
 */
export const getCustomFields = async (req: Request, res: Response) => {
  try {
    // Validate iframe JWT FIRST
    if (!req.query.auth_token) {
      return res.status(401).json({ error: 'invalid_iframe_token', message: 'Missing auth_token query parameter' });
    }

    const authToken = z.string().parse(req.query.auth_token);

    // Verify JWT
    const claims = await verifyClockifyJwt(authToken, process.env.ADDON_KEY!);

    // Extract claims INCLUDING backendUrl for developer sandbox support
    const { workspaceId, addonId, backendUrl } = claims;

    logger.debug({ workspaceId, addonId, backendUrl }, 'Fetching custom fields');

    // Fetch installation token from database
    const installation = await getInstallation(addonId || CONFIG.ADDON_KEY, workspaceId);
    const installationToken = installation?.installationToken;

    if (!installationToken) {
      logger.warn({ workspaceId, addonId }, 'No installation token found for workspace');
      return res.status(401).json({
        error: 'No installation found',
        message: 'Add-on not properly installed for this workspace'
      });
    }

    // Build API URL from JWT backendUrl (supports developer sandbox)
    const apiBaseUrl = backendUrl ? `${backendUrl.replace(/\/$/, '')}/v1` : undefined;

    // Fetch custom fields from Clockify API
    const fields = await clockifyClient.getCustomFields(workspaceId, req.correlationId, installationToken, apiBaseUrl);

    // Handle undefined response
    if (!fields || !Array.isArray(fields)) {
      logger.warn({ workspaceId, fields }, 'Custom fields response is not valid');
      return res.status(502).json({
        error: 'Invalid response from Clockify API',
        message: 'Custom fields could not be retrieved'
      });
    }

    // Filter and map to simple format
    const filtered = fields.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type || 'TEXT'
    }));

    res.json(filtered);

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: req.correlationId
    }, 'CF fields fetch failed');

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('JWT verification failed')) {
      return res.status(401).json({
        error: 'Invalid authentication token'
      });
    }

    // Check for non-JSON upstream response
    if (error instanceof Error && error.message.includes('content-type')) {
      return res.status(502).json({
        error: 'upstream_non_json',
        message: 'Clockify API returned non-JSON response'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
