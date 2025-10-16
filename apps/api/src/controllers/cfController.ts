import type { Request, Response } from 'express';
import { logger } from '../lib/logger.js';
import { resolveAddonContext } from '../lib/clockifyAuth.js';

/**
 * GET /v1/cf/fields
 * Proxy to Clockify custom fields endpoint
 */
export const getCustomFields = async (req: Request, res: Response) => {
  try {
    const { token, backendUrl, workspaceId } = await resolveAddonContext(req);
    const base = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
    const url = new URL(`v1/workspaces/${workspaceId}/custom-fields`, base).toString();

    logger.debug({ workspaceId }, 'Fetching custom fields from Clockify');

    const response = await fetch(url, {
      headers: {
        'X-Addon-Token': token,
        'Accept': 'application/json',
        'User-Agent': 'xCFE/1.0.0'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      const snippet = text.slice(0, 200);
      logger.warn({ workspaceId, status: response.status, detail: snippet }, 'Clockify custom fields request failed');
      return res.status(response.status).json({ error: 'UPSTREAM_ERROR', status: response.status, detail: snippet });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await response.text();
      return res.status(200).json({ ok: true, detail: text });
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return res.status(502).json({ error: 'Invalid response from Clockify', detail: 'Custom fields response must be an array' });
    }

    const mapped = data.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type ?? 'TEXT'
    }));

    return res.json(mapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: message }, 'Failed to fetch custom fields');

    if (message.includes('workspaceId/user must be 24')) {
      return res.status(400).json({ error: 'BadRequest', detail: message });
    }

    return res.status(500).json({ error: 'Failed to fetch custom fields', detail: message });
  }
};
