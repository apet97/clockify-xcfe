import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { logger } from '../lib/logger.js';
import { CONFIG } from '../config/index.js';
import { clockifyWebhookHandler } from '../controllers/webhookController.js';

const router: Router = Router();

// Schema for time entry data
const TimeEntrySchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  workspaceId: z.string(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  timeInterval: z.object({
    start: z.string(),
    end: z.string().optional(),
    duration: z.string().optional()
  }),
  customFields: z.array(z.object({
    customFieldId: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]).optional()
  })).optional(),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).optional()
});

/**
 * Time entry created webhook
 */
export const timeEntryCreated = async (req: Request, res: Response) => {
  // Normalize headers for consolidated handler
  const eventType = req.headers['clockify-webhook-event-type'] as string;
  if (!eventType) req.headers['clockify-webhook-event-type'] = 'NEW_TIME_ENTRY';
  const sig = (req.headers['clockify-signature'] as string) || '';
  if (sig && !req.headers['x-clockify-signature']) req.headers['x-clockify-signature'] = sig;
  req.headers['x-clockify-event'] = 'NEW_TIME_ENTRY';
  return clockifyWebhookHandler(req, res, (err) => {
    if (err) {
      logger.error({ err }, 'Legacy created route failed');
      return res.status(500).json({ error: 'handler_error' });
    }
  });
};

router.post('/time-entry-created', timeEntryCreated);

// Liveness probe (GET) for platform validation
router.get('/time-entry-created', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'time-entry-created' });
});

/**
 * Time entry updated webhook
 */
export const timeEntryUpdated = async (req: Request, res: Response) => {
  const sig = (req.headers['clockify-signature'] as string) || '';
  if (sig && !req.headers['x-clockify-signature']) req.headers['x-clockify-signature'] = sig;
  req.headers['x-clockify-event'] = 'TIME_ENTRY_UPDATED';
  return clockifyWebhookHandler(req, res, (err) => {
    if (err) {
      logger.error({ err }, 'Legacy updated route failed');
      return res.status(500).json({ error: 'handler_error' });
    }
  });
};

router.post('/time-entry-updated', timeEntryUpdated);

router.get('/time-entry-updated', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'time-entry-updated' });
});

/**
 * Time entry deleted webhook
 */
export const timeEntryDeleted = async (req: Request, res: Response) => {
  const sig = (req.headers['clockify-signature'] as string) || '';
  if (sig && !req.headers['x-clockify-signature']) req.headers['x-clockify-signature'] = sig;
  req.headers['x-clockify-event'] = 'TIME_ENTRY_DELETED';
  return clockifyWebhookHandler(req, res, (err) => {
    if (err) {
      logger.error({ err }, 'Legacy deleted route failed');
      return res.status(500).json({ error: 'handler_error' });
    }
  });
};

router.post('/time-entry-deleted', timeEntryDeleted);

router.get('/time-entry-deleted', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, route: 'time-entry-deleted' });
});

// Consolidated webhook endpoint used by auto-registrar and README
router.post('/clockify', clockifyWebhookHandler);

export default router;
