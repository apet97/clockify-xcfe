import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { getInstallation } from '../services/installationService.js';
import { getInstallationTokenFromMemory } from '../services/installMemory.js';

export const proxyTimeEntries: RequestHandler = async (req, res) => {
  const authToken = (req.query.auth_token as string) || undefined;
  const correlationId = req.correlationId || 'unknown';

  try {
    // Parse the JWT claims if provided (used for URL scoping and DB fallback)
    let backendUrl = CONFIG.CLOCKIFY_BASE_URL;
    let workspaceId: string | undefined;
    let addonId: string | undefined;
    let userId: string | undefined;

    let verifiedClaims: any | undefined;
    if (authToken) {
      try {
        // Skip strict subject check to support dev sandbox tokens
        verifiedClaims = await verifyClockifyJwt(authToken);
        backendUrl = verifiedClaims.backendUrl || CONFIG.CLOCKIFY_BASE_URL;
        workspaceId = verifiedClaims.workspaceId;
        addonId = verifiedClaims.addonId;
        userId = verifiedClaims.userId ?? verifiedClaims.user;
      } catch (e) {
        logger.warn({ correlationId }, 'Failed to verify iframe JWT for proxy; returning 401');
        return res.status(401).json({
          error: 'Invalid or expired authentication token',
          correlationId
        });
      }
    }

    // In production flow, require JWT claims for workspace/user context
    if (CONFIG.NODE_ENV === 'production' && !verifiedClaims) {
      logger.warn({ correlationId }, 'Missing JWT claims in production flow');
      return res.status(403).json({
        error: 'Authentication required for this operation',
        correlationId
      });
    }

    // Fallback to query params only in development mode
    if (CONFIG.NODE_ENV === 'development' && !verifiedClaims) {
      workspaceId = (req.query.workspaceId as string) || CONFIG.WORKSPACE_ID;
      addonId = (req.query.addonId as string) || CONFIG.ADDON_ID;
      userId = (req.query.userId as string) || undefined;
    }

    // Extract query parameters
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!start || !end) {
      return res.status(400).json({
        error: 'Missing start or end parameters',
        correlationId
      });
    }

    // Resolve credentials with priority cascade
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'xCFE/1.0.0'
    };

    let credentialSource: 'installation-token' | 'memory-token' | 'global-addon-token' | 'global-api-key' | 'iframe-jwt-token' | 'none' = 'none';

    // Priority 1: iframe JWT present -> use installation token or server-side exchange
    if (verifiedClaims) {
      // 1) DB token if available
      if (addonId && workspaceId) {
        const installation = await getInstallation(addonId, workspaceId);
        if (installation?.installationToken) {
          headers['X-Addon-Token'] = installation.installationToken;
          credentialSource = 'installation-token';
          logger.debug({ addonId, workspaceId, correlationId }, 'Using installation token for proxy request');
        }
      }

      // 2) In-memory token captured via lifecycle
      if (!headers['X-Addon-Token'] && workspaceId) {
        const mem = getInstallationTokenFromMemory(workspaceId);
        if (mem) {
          headers['X-Addon-Token'] = mem;
          credentialSource = 'memory-token';
          logger.debug({ workspaceId, correlationId }, 'Using in-memory installation token for proxy request');
        }
      }

      // 3) Global env add-on token
      if (!headers['X-Addon-Token'] && CONFIG.ADDON_TOKEN) {
        headers['X-Addon-Token'] = CONFIG.ADDON_TOKEN;
        credentialSource = 'global-addon-token';
        logger.debug({ workspaceId, correlationId }, 'Using global ADDON_TOKEN for proxy request');
      }

      // 4) Developer sandbox last-resort: use iframe JWT directly
      try {
        const host = new URL(backendUrl).host;
        const isDev = /(^|\.)developer\.clockify\.me$/.test(host);
        if (!headers['X-Addon-Token'] && isDev && authToken) {
          headers['X-Addon-Token'] = authToken;
          credentialSource = 'iframe-jwt-token';
          logger.debug({ workspaceId, correlationId }, 'Using iframe JWT as X-Addon-Token for developer sandbox');
        }
      } catch {}
    }
    // Priority 2: Installation token from database (non-JWT flow, dev only)
    else if (CONFIG.NODE_ENV === 'development' && addonId && workspaceId) {
      const installation = await getInstallation(addonId, workspaceId);
      if (installation?.installationToken) {
        headers['X-Addon-Token'] = installation.installationToken;
        credentialSource = 'installation-token';
        logger.debug({ addonId, workspaceId, correlationId }, 'Using installation token for proxy request');
      }
    }
    // Priority 3: Global addon token from env (non-JWT flow, dev only)
    else if (CONFIG.NODE_ENV === 'development' && CONFIG.ADDON_TOKEN) {
      headers['X-Addon-Token'] = CONFIG.ADDON_TOKEN;
      credentialSource = 'global-addon-token';
    }
    // Priority 4: Global API key from env (non-JWT flow, dev only)
    else if (CONFIG.NODE_ENV === 'development' && CONFIG.API_KEY) {
      headers['X-Api-Key'] = CONFIG.API_KEY;
      credentialSource = 'global-api-key';
    }

    // If still no credentials, return 403 (dev-only: empty payload)
    if (!headers['X-Addon-Token'] && !headers['X-Api-Key']) {
      if (CONFIG.NODE_ENV === 'development') {
        logger.warn({ correlationId }, 'No Clockify credentials configured, returning empty array for dev mode');
        return res.json({ timeEntries: [] });
      }
      logger.error({ workspaceId, addonId, correlationId }, 'No Clockify credentials available for this installation');
      return res.status(403).json({
        error: 'Clockify credentials are not configured for this installation',
        correlationId
      });
    }

    // Normalize API base:
    // - Developer env (developer.clockify.me) uses /api without /v1
    // - Production env typically requires /api/v1
    const trimmed = backendUrl.replace(/\/$/, '');
    const isDeveloperEnv = /(^|\.)developer\.clockify\.me$/.test(new URL(trimmed).host);
    const apiBase = isDeveloperEnv
      ? trimmed
      : (trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`);
    
    // Build both user-scoped and fallback URLs
    const uidCandidate = userId;
    if (!workspaceId || !uidCandidate) {
      logger.warn({ workspaceId, userId: uidCandidate, correlationId }, 'Missing user/workspace context for Clockify URL');
      return res.status(400).json({ error: 'Missing user context to query time entries', correlationId });
    }

    // Build URLs with proper construction to avoid double slashes
    const userScopedUrl = new URL(`workspaces/${workspaceId}/user/${uidCandidate}/time-entries`, apiBase.endsWith('/') ? apiBase : apiBase + '/');
    userScopedUrl.searchParams.set('start', start);
    userScopedUrl.searchParams.set('end', end);

    const fallbackUrl = new URL(`workspaces/${workspaceId}/time-entries`, apiBase.endsWith('/') ? apiBase : apiBase + '/');
    fallbackUrl.searchParams.set('userId', String(uidCandidate));
    fallbackUrl.searchParams.set('start', start);
    fallbackUrl.searchParams.set('end', end);

    // Try user-scoped first
    let response = await fetch(userScopedUrl, { headers });
    if (response.status === 404 || response.status === 405) {
      // Fallback to legacy path in case environment doesn't support user-scoped
      logger.debug({ correlationId }, 'User-scoped endpoint not available; falling back to legacy query param path');
      response = await fetch(fallbackUrl, { headers });
    }

    if (!response.ok) {
      const text = (await response.text()).slice(0, 200);
      const retryAfter = response.headers.get('Retry-After') ?? undefined;
      if (retryAfter) res.set('Retry-After', retryAfter);
      logger.warn({ status: response.status, message: text, correlationId }, 'Clockify API request failed');
      return res.status(response.status).json({ status: response.status, message: text, retryAfter, correlationId });
    }

    const ctype = response.headers.get('content-type') || '';
    if (!ctype.toLowerCase().includes('application/json')) {
      logger.warn({ correlationId, contentType: ctype }, 'Unexpected upstream content-type');
      return res.status(502).json({ error: 'Unexpected upstream content-type', correlationId });
    }

    const data = await response.json();
    logger.debug({ entryCount: Array.isArray(data) ? data.length : 'unknown', correlationId }, 'Successfully proxied time entries');
    res.json(data);

  } catch (error) {
    logger.error({
      err: error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : String(error),
      correlationId
    }, 'Proxy request failed');

    // Return 502 Bad Gateway for upstream connectivity issues
    res.status(502).json({
      error: 'Clockify upstream error',
      message: error instanceof Error ? error.message : 'Failed to communicate with Clockify API',
      correlationId
    });
  }
};
