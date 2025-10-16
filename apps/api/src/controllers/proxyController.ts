/**
 * Proxy Controller - Proxies to Clockify Time Entries API
 *
 * Proxies time entry requests to Clockify using the iframe's auth_token as X-Addon-Token.
 * The JWT contains backendUrl, workspaceId, and user information needed for the API call.
 */

import type { RequestHandler } from 'express';
import { logger } from '../lib/logger.js';
import { verifyAddonToken, getContextFromToken } from '../lib/clockifyAuth.js';
import { CONFIG } from '../config/index.js';

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
 * GET /v1/proxy/time-entries
 *
 * Proxies to Clockify's Time Entries API:
 * ${backendUrl}/v1/workspaces/${workspaceId}/user/${userId}/time-entries?start=...&end=...
 *
 * Requires auth_token query param (JWT from iframe) which is used as X-Addon-Token header.
 */
export const proxyTimeEntries: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  // CORS check
  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected request from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Extract auth token from query parameter
  const authToken = req.query.auth_token as string | undefined;
  if (!authToken) {
    logger.warn({ correlationId }, 'Missing auth_token in GET /v1/proxy/time-entries');
    return res.status(401).json({ error: 'Missing auth_token parameter' });
  }

  // Extract start and end query parameters
  const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;

  if (!start || !end) {
    logger.warn({ correlationId }, 'Missing start or end parameters');
    return res.status(400).json({
      error: 'Missing required parameters',
      detail: 'Both start and end query parameters are required (ISO 8601 format)'
    });
  }

  // Validate ISO 8601 format
  try {
    new Date(start).toISOString();
    new Date(end).toISOString();
  } catch (error) {
    logger.warn({ start, end, correlationId }, 'Invalid date format for start/end');
    return res.status(400).json({
      error: 'Invalid date format',
      detail: 'start and end must be valid ISO 8601 date strings'
    });
  }

  try {
    // Verify token signature and claims
    await verifyAddonToken(authToken);
    const { backendUrl, workspaceId, userId } = getContextFromToken(authToken);

    // Build Clockify Time Entries API URL
    // Pattern: ${backendUrl}/v1/workspaces/${workspaceId}/user/${userId}/time-entries
    const timeEntriesUrl = new URL(
      `v1/workspaces/${workspaceId}/user/${userId}/time-entries`,
      backendUrl.endsWith('/') ? backendUrl : backendUrl + '/'
    );

    timeEntriesUrl.searchParams.set('start', start);
    timeEntriesUrl.searchParams.set('end', end);

    logger.debug(
      {
        method: 'GET',
        url: timeEntriesUrl.pathname,
        workspaceId,
        userId,
        start,
        end,
        correlationId
      },
      'Proxying to Clockify Time Entries API'
    );

    // Proxy request to Clockify with X-Addon-Token
    const response = await fetch(timeEntriesUrl.toString(), {
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
          upstream: new URL(timeEntriesUrl).host,
          path: new URL(timeEntriesUrl).pathname,
          detail: snippet,
          correlationId
        },
        'Clockify Time Entries API returned non-2xx'
      );

      // Bubble up the upstream status and body
      return res.status(response.status).json({
        error: 'UPSTREAM_ERROR',
        status: response.status,
        detail: snippet
      });
    }

    // Stream or return the upstream result
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      logger.warn({ contentType, correlationId }, 'Unexpected content-type from Clockify');
      return res.status(502).json({
        error: 'Unexpected upstream content-type',
        detail: `Expected application/json, got ${contentType}`
      });
    }

    const data = await response.json();
    const entryCount = Array.isArray(data) ? data.length : 'unknown';

    logger.debug(
      {
        entryCount,
        workspaceId,
        userId,
        correlationId
      },
      'Successfully proxied time entries from Clockify'
    );

    return res.json(data);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    logger.error(
      {
        err: error,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        correlationId
      },
      'Failed to proxy time entries request'
    );

    return res.status(502).json({
      error: 'Clockify upstream error',
      detail: message,
      correlationId
    });
  }
};
