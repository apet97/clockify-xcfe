/**
 * Settings Controller - Proxy to Clockify Settings API
 */

import type { Request, RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { resolveAddonContext } from '../lib/clockifyAuth.js';

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;

  const allowedOrigins = CONFIG.ADMIN_UI_ORIGIN
    ? CONFIG.ADMIN_UI_ORIGIN.split(',').map(o => o.trim())
    : [];

  const clockifyOrigins = [
    'https://app.clockify.me',
    'https://developer.clockify.me',
    'https://clockify.me'
  ];

  try {
    const originHost = new URL(origin).host;
    const baseHost = new URL(CONFIG.BASE_URL).host;
    if (originHost === baseHost) {
      return true;
    }
  } catch {
    // ignore URL parse errors and continue
  }

  const allowed = [...allowedOrigins, ...clockifyOrigins];
  return allowed.some(entry => origin === entry || origin?.endsWith(`.${entry.replace('https://', '')}`));
};

const buildSettingsUrl = (backendUrl: string, workspaceId: string) => {
  const base = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
  return `${base}addon/workspaces/${workspaceId}/settings`;
};

export const getSettings: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected settings request from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  try {
    const { token, backendUrl, workspaceId } = await resolveAddonContext(req);
    const settingsUrl = buildSettingsUrl(backendUrl, workspaceId);

    logger.debug({ workspaceId, correlationId }, 'Proxying GET settings to Clockify');

    const response = await fetch(settingsUrl, {
      method: 'GET',
      headers: {
        'X-Addon-Token': token,
        'Accept': 'application/json',
        'User-Agent': 'xCFE/1.0.0'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      const snippet = text.slice(0, 200);
      logger.warn({ workspaceId, status: response.status, detail: snippet, correlationId }, 'Clockify settings fetch failed');
      return res.status(response.status).json({ error: 'UPSTREAM_ERROR', status: response.status, detail: snippet });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message, correlationId }, 'Failed to proxy GET settings');

    if (message.includes('workspaceId/user must be 24')) {
      return res.status(400).json({ error: 'BadRequest', detail: message });
    }

    return res.status(500).json({ error: 'Failed to fetch settings', detail: message });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected settings update from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  try {
    const { token, backendUrl, workspaceId } = await resolveAddonContext(req);
    const settingsUrl = buildSettingsUrl(backendUrl, workspaceId);
    const payload = req.body ?? {};

    logger.debug({ workspaceId, correlationId }, 'Proxying PATCH settings to Clockify');

    const response = await fetch(settingsUrl, {
      method: 'PATCH',
      headers: {
        'X-Addon-Token': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'xCFE/1.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      const snippet = text.slice(0, 200);
      logger.warn({ workspaceId, status: response.status, detail: snippet, correlationId }, 'Clockify settings update failed');
      return res.status(response.status).json({ error: 'UPSTREAM_ERROR', status: response.status, detail: snippet });
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return res.status(204).send();
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await response.text();
      return res.status(200).json({ ok: true, detail: text || 'Settings updated' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message, correlationId }, 'Failed to proxy PATCH settings');

    if (message.includes('workspaceId/user must be 24')) {
      return res.status(400).json({ error: 'BadRequest', detail: message });
    }

    return res.status(500).json({ error: 'Failed to update settings', detail: message });
  }
};
