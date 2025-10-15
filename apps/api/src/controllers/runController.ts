import type { RequestHandler } from 'express';
import { z } from 'zod';
import { listRecentRuns } from '../services/runService.js';
import type { Request } from 'express';
import { verifyMagicLink, verifyClockifyJwt } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';

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

export const getRuns: RequestHandler = async (req, res, next) => {
  try {
    // Auth gate: bearer magic-link preferred; otherwise iframe token
    const token = extractAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Missing authentication token' });
    try {
      if ((req.header('authorization') || '').startsWith('Bearer ')) {
        await verifyMagicLink(token);
      } else {
        await verifyClockifyJwt(token, CONFIG.ADDON_KEY);
      }
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    const limit = z.coerce.number().int().min(1).max(500).default(100).parse(req.query.limit);
    const runs = await listRecentRuns(limit);
    res.json({ runs });
  } catch (error) {
    next(error);
  }
};
