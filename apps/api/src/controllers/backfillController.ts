import type { RequestHandler, Request } from 'express';
import { z } from 'zod';
import { runBackfill, type BackfillParams } from '../services/backfillService.js';
import { verifyMagicLink, verifyClockifyJwt } from '../lib/jwt.js';
import { getInstallation } from '../services/installationService.js';
import { CONFIG } from '../config/index.js';

const backfillSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  userId: z.string().optional(),
  dryRun: z.boolean().default(false)
});

const extractAuthToken = (req: Request): string | null => {
  const authHeader = req.header('authorization');
  if (authHeader) {
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (m && m[1]?.trim()) return m[1].trim();
  }
  const token = req.query.auth_token;
  if (typeof token === 'string' && token.trim()) return token.trim();
  return null;
};

export const executeBackfill: RequestHandler = async (req, res, next) => {
  try {
    const payload = backfillSchema.parse(req.body);
    const token = extractAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Missing authentication token' });
    let workspaceId: string;
    let claims: any;
    try {
      if ((req.header('authorization') || '').startsWith('Bearer ')) {
        claims = await verifyMagicLink(token);
        workspaceId = claims.workspaceId;
      } else {
        claims = await verifyClockifyJwt(token, CONFIG.ADDON_KEY);
        workspaceId = claims.workspaceId;
      }
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Ensure required fields are present
    if (!payload.to) {
      return res.status(400).json({ error: 'Missing required field: to' });
    }
    // Resolve installation token if available
    let installationToken: string | undefined;
    try {
      const addonId = (claims && claims.addonId) || CONFIG.ADDON_KEY;
      const install = await getInstallation(addonId, workspaceId);
      installationToken = install?.installationToken;
    } catch {}

    const result = await runBackfill(payload as BackfillParams, {
      workspaceId,
      authToken: installationToken,
      baseUrlOverride: (claims && claims.backendUrl) ? String(claims.backendUrl).replace(/\/$/, '').endsWith('/v1') ? String(claims.backendUrl).replace(/\/$/, '') : String(claims.backendUrl).replace(/\/$/, '') + '/v1' : undefined
    });
    res.status(202).json({ accepted: true, result });
  } catch (error) {
    next(error);
  }
};
