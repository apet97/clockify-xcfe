/**
 * Proxy Controller - Time entry proxying to Clockify API
 */

import type { RequestHandler } from 'express';
import { logger } from '../lib/logger.js';
import { resolveAddonContext } from '../lib/clockifyAuth.js';
import { CONFIG } from '../config/index.js';

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
  } catch {}

  const allowed = [...allowedOrigins, ...clockifyOrigins];
  return allowed.some(entry => origin === entry || origin?.endsWith(`.${entry.replace('https://', '')}`));
};

const buildUserEntriesUrl = (base: string, workspaceId: string, userId: string, start: string, end: string) => {
  const root = base.endsWith('/') ? base : `${base}/`;
  const url = new URL(`v1/workspaces/${workspaceId}/user/${userId}/time-entries`, root);
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);
  return url.toString();
};

export const proxyTimeEntries: RequestHandler = async (req, res) => {
  const correlationId = (req as any).correlationId || 'unknown';
  const origin = req.header('origin');

  if (origin && !isAllowedOrigin(origin)) {
    logger.warn({ origin, correlationId }, 'Rejected proxy request from disallowed origin');
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;

  if (!start || !end) {
    return res.status(400).json({ error: 'Missing required parameters', detail: 'start and end query params are required' });
  }

  try {
    const { token, backendUrl, workspaceId, userId } = await resolveAddonContext(req);
    const url = buildUserEntriesUrl(backendUrl, workspaceId, userId, start, end);

    logger.debug({ workspaceId, userId, start, end, correlationId }, 'Proxying time entries request');

    const response = await fetch(url, {
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
      logger.warn({ workspaceId, status: response.status, detail: snippet, correlationId }, 'Clockify time entries request failed');
      return res.status(response.status).json({ error: 'UPSTREAM_ERROR', status: response.status, detail: snippet });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await response.text();
      return res.status(200).json({ ok: true, detail: text });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message, correlationId }, 'Failed to proxy time entries');

    if (message.includes('workspaceId/user must be 24')) {
      return res.status(400).json({ error: 'BadRequest', detail: message });
    }

    return res.status(502).json({ error: 'Clockify upstream error', detail: message, correlationId });
  }
};
