/**
 * Settings Controller - Proxies to Clockify Settings API
 *
 * Settings are stored and managed by Clockify, not in our database.
 * All requests proxy to ${backendUrl}/addon/workspaces/${workspaceId}/settings
 * with X-Addon-Token header containing the iframe's auth_token.
 */

import type { Request, RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { verifyAddonToken, getContextFromToken } from '../lib/clockifyAuth.js';

/**
 * Extract auth token from Authorization header or query parameter
 */
const extractAuthToken = (req: Request): string | null => {
  // Try Authorization: Bearer header first
  const authHeader = req.header('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  // Fallback to query parameter (iframe URL pattern)
  const token = req.query.auth_token;
  if (typeof token === 'string' && token.trim().length > 0) {
    return token.trim();
  }

  return null;
};

/**
 * Check if origin is allowed for CORS
 */
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Same-origin requests

  const allowedOrigins = CONFIG.ADMIN_UI_ORIGIN
    ? CONFIG.ADMIN_UI_ORIGIN.split(',').map(o => o.trim())
    : [];

  // Always allow Clockify domains
  const clockifyDomains = [
    'https://app.clockify.me',
    'https://developer.clockify.me',
    'https://clockify.me'
  ];

  const allAllowed = [...allowedOrigins, ...clockifyDomains];

  return allAllowed.some(allowed => origin === allowed || origin.endsWith(`.${allowed.replace('https://', '')}`));
};

/**
 * GET /v1/settings
 *
 * Proxies to Clockify's Settings API to retrieve workspace settings.
 * Settings are persisted by Clockify, not in our database.
 */
export const getSettings: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  // CORS check
  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected request from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Extract and verify auth token
  const authToken = extractAuthToken(req);
  if (!authToken) {
    logger.warn({ correlationId }, 'Missing auth token in GET /v1/settings');
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    // Verify token signature and claims
    await verifyAddonToken(authToken);
    const { backendUrl, workspaceId } = getContextFromToken(authToken);

    // Build Clockify Settings API URL
    const settingsUrl = `${backendUrl}/addon/workspaces/${workspaceId}/settings`;

    logger.debug(
      {
        method: 'GET',
        url: new URL(settingsUrl).pathname,
        workspaceId,
        correlationId
      },
      'Proxying to Clockify Settings API'
    );

    // Proxy request to Clockify
    const response = await fetch(settingsUrl, {
      method: 'GET',
      headers: {
        'X-Addon-Token': authToken,
        'Accept': 'application/json',
        'User-Agent': 'xCFE/1.0.0'
      }
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const text = await response.text();
      const snippet = text.slice(0, 200);

      logger.warn(
        {
          status: response.status,
          upstream: new URL(settingsUrl).host,
          detail: snippet,
          correlationId
        },
        'Clockify Settings API returned non-2xx'
      );

      return res.status(response.status).json({
        error: 'UPSTREAM_ERROR',
        status: response.status,
        detail: snippet
      });
    }

    // Return Clockify response as-is
    const data = await response.json();
    logger.debug({ workspaceId, correlationId }, 'Successfully retrieved settings from Clockify');
    return res.json(data);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    logger.error(
      {
        err: error,
        message,
        correlationId
      },
      'Failed to fetch settings from Clockify'
    );

    return res.status(500).json({
      error: 'Failed to fetch settings',
      detail: message
    });
  }
};

/**
 * POST /v1/settings
 *
 * Proxies to Clockify's Settings API to update workspace settings.
 * Settings are persisted by Clockify, not in our database.
 */
export const updateSettings: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  // CORS check
  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected request from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Extract and verify auth token
  const authToken = extractAuthToken(req);
  if (!authToken) {
    logger.warn({ correlationId }, 'Missing auth token in POST /v1/settings');
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    // Verify token signature and claims
    await verifyAddonToken(authToken);
    const { backendUrl, workspaceId } = getContextFromToken(authToken);

    // Build Clockify Settings API URL
    const settingsUrl = `${backendUrl}/addon/workspaces/${workspaceId}/settings`;

    logger.debug(
      {
        method: 'POST',
        url: new URL(settingsUrl).pathname,
        workspaceId,
        correlationId
      },
      'Proxying to Clockify Settings API'
    );

    // Proxy request to Clockify with the same body
    const response = await fetch(settingsUrl, {
      method: 'POST',
      headers: {
        'X-Addon-Token': authToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'xCFE/1.0.0'
      },
      body: JSON.stringify(req.body)
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const text = await response.text();
      const snippet = text.slice(0, 200);

      logger.warn(
        {
          status: response.status,
          upstream: new URL(settingsUrl).host,
          detail: snippet,
          correlationId
        },
        'Clockify Settings API returned non-2xx'
      );

      return res.status(response.status).json({
        error: 'UPSTREAM_ERROR',
        status: response.status,
        detail: snippet
      });
    }

    // Return 204 No Content or the Clockify response
    if (response.status === 204) {
      logger.debug({ workspaceId, correlationId }, 'Successfully updated settings in Clockify');
      return res.status(204).send();
    }

    const data = await response.json();
    logger.debug({ workspaceId, correlationId }, 'Successfully updated settings in Clockify');
    return res.json(data);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    logger.error(
      {
        err: error,
        message,
        correlationId
      },
      'Failed to update settings in Clockify'
    );

    return res.status(500).json({
      error: 'Failed to update settings',
      detail: message
    });
  }
};
