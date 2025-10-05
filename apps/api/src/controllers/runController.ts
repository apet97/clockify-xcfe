import type { RequestHandler } from 'express';
import { z } from 'zod';
import { listRecentRuns } from '../services/runService.js';

export const getRuns: RequestHandler = async (req, res, next) => {
  try {
    const limit = z.coerce.number().int().min(1).max(500).default(100).parse(req.query.limit);
    const runs = await listRecentRuns(limit);
    res.json({ runs });
  } catch (error) {
    next(error);
  }
};
