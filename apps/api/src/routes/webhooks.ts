import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { logger } from '../lib/logger.js';
import { verifyClockifyJwt, type WebhookTokenPayload } from '../lib/clockifyJwt.js';
import { CONFIG } from '../config/index.js';

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
router.post('/time-entry-created', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['clockify-signature'] as string;
    const eventType = req.headers['clockify-webhook-event-type'] as string;

    if (!signature || eventType !== 'NEW_TIME_ENTRY') {
      return res.status(400).json({ error: 'Missing or invalid webhook headers' });
    }

    // Verify webhook signature
    const payload = verifyClockifyJwt(signature, CONFIG.ADDON_KEY, 'webhook') as WebhookTokenPayload;
    
    // Validate time entry data
    const timeEntry = TimeEntrySchema.parse(req.body);
    
    logger.info('Time entry created webhook received', {
      timeEntryId: timeEntry.id,
      workspaceId: payload.workspaceId,
      userId: timeEntry.userId,
      correlationId: req.correlationId
    });

    // Process the time entry for formula evaluation
    await processTimeEntryForFormulas(timeEntry, payload.workspaceId);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Time entry created webhook error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid webhook payload' });
  }
});

/**
 * Time entry updated webhook
 */
router.post('/time-entry-updated', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['clockify-signature'] as string;
    const eventType = req.headers['clockify-webhook-event-type'] as string;

    if (!signature || eventType !== 'TIME_ENTRY_UPDATED') {
      return res.status(400).json({ error: 'Missing or invalid webhook headers' });
    }

    const payload = verifyClockifyJwt(signature, CONFIG.ADDON_KEY, 'webhook') as WebhookTokenPayload;
    const timeEntry = TimeEntrySchema.parse(req.body);
    
    logger.info('Time entry updated webhook received', {
      timeEntryId: timeEntry.id,
      workspaceId: payload.workspaceId,
      userId: timeEntry.userId,
      correlationId: req.correlationId
    });

    // Process the updated time entry
    await processTimeEntryForFormulas(timeEntry, payload.workspaceId);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Time entry updated webhook error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid webhook payload' });
  }
});

/**
 * Time entry deleted webhook
 */
router.post('/time-entry-deleted', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['clockify-signature'] as string;
    const eventType = req.headers['clockify-webhook-event-type'] as string;

    if (!signature || eventType !== 'TIME_ENTRY_DELETED') {
      return res.status(400).json({ error: 'Missing or invalid webhook headers' });
    }

    const payload = verifyClockifyJwt(signature, CONFIG.ADDON_KEY, 'webhook') as WebhookTokenPayload;
    
    // For deleted entries, we might only get the ID
    const { id: timeEntryId } = req.body;
    
    logger.info('Time entry deleted webhook received', {
      timeEntryId,
      workspaceId: payload.workspaceId,
      correlationId: req.correlationId
    });

    // Clean up any formula evaluation data for this entry
    await cleanupTimeEntryData(timeEntryId, payload.workspaceId);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Time entry deleted webhook error', { error, correlationId: req.correlationId });
    res.status(400).json({ error: 'Invalid webhook payload' });
  }
});

/**
 * Process time entry for formula evaluation
 */
async function processTimeEntryForFormulas(timeEntry: any, workspaceId: string): Promise<void> {
  try {
    logger.debug('Processing time entry for formulas', {
      timeEntryId: timeEntry.id,
      workspaceId,
      hasCustomFields: !!timeEntry.customFields?.length
    });

    // TODO: Implement formula evaluation logic
    // 1. Fetch active formulas for this workspace
    // 2. Evaluate formulas against the time entry data
    // 3. Update custom fields if needed
    // 4. Log the evaluation results

    logger.info('Time entry processed successfully', {
      timeEntryId: timeEntry.id,
      workspaceId
    });
  } catch (error) {
    logger.error('Error processing time entry for formulas', {
      error,
      timeEntryId: timeEntry.id,
      workspaceId
    });
    throw error;
  }
}

/**
 * Clean up time entry data
 */
async function cleanupTimeEntryData(timeEntryId: string, workspaceId: string): Promise<void> {
  try {
    logger.debug('Cleaning up time entry data', {
      timeEntryId,
      workspaceId
    });

    // TODO: Implement cleanup logic
    // 1. Remove any cached evaluation results
    // 2. Clean up audit logs
    // 3. Remove any pending formula evaluations

    logger.info('Time entry data cleaned up successfully', {
      timeEntryId,
      workspaceId
    });
  } catch (error) {
    logger.error('Error cleaning up time entry data', {
      error,
      timeEntryId,
      workspaceId
    });
    throw error;
  }
}

export default router;