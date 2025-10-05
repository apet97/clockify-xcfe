import type { RequestHandler } from 'express';
import { z } from 'zod';
import { runBackfill } from '../services/backfillService.js';

const backfillSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  userId: z.string().optional(),
  dryRun: z.boolean().default(false)
});

export const executeBackfill: RequestHandler = async (req, res, next) => {
  try {
    const payload = backfillSchema.parse(req.body);
    const result = await runBackfill(payload);
    res.status(202).json({ accepted: true, result });
  } catch (error) {
    next(error);
  }
};
