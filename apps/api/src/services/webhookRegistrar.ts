import { CONFIG } from '../config/index.js';
import { clockifyClient, RateLimitError } from '../lib/clockifyClient.js';
import { logger } from '../lib/logger.js';

const EVENTS = ['NEW_TIME_ENTRY', 'NEW_TIMER_STARTED', 'TIME_ENTRY_UPDATED', 'TIME_ENTRY_DELETED', 'BILLABLE_RATE_UPDATED'];

interface WebhookInfo {
  id: string;
  event: string;
  url: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ensureWebhooks = async (): Promise<string[]> => {
  if (!CONFIG.ADDON_ID || !CONFIG.WEBHOOK_PUBLIC_URL) {
    logger.warn('Skipping webhook bootstrap because ADDON_ID or WEBHOOK_PUBLIC_URL is missing');
    return [];
  }

  const targetUrl = new URL('/v1/webhooks/clockify', CONFIG.WEBHOOK_PUBLIC_URL).toString();
  const webhookReconcile = process.env.WEBHOOK_RECONCILE === 'true';
  
  try {
    // List existing webhooks with retry on rate limit
    let webhooks: WebhookInfo[] = [];
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        webhooks = await clockifyClient.listWebhooks(CONFIG.WORKSPACE_ID, CONFIG.ADDON_ID);
        break;
      } catch (error) {
        if (error instanceof RateLimitError && retryCount < maxRetries) {
          const delayMs = error.retryAfterMs || 1000;
          logger.warn({ retryAfterMs: delayMs, attempt: retryCount + 1 }, 'Rate limited while listing webhooks, retrying');
          await sleep(delayMs);
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    // Find webhooks for our target URL
    const targetWebhooks = webhooks.filter(webhook => webhook.url === targetUrl);
    const existingWebhookIds: string[] = [];

    if (targetWebhooks.length > 0) {
      logger.info({ 
        webhookIds: targetWebhooks.map(w => w.id), 
        url: targetUrl 
      }, 'Found existing webhooks for target URL');
      existingWebhookIds.push(...targetWebhooks.map(w => w.id));
    }

    // Create missing webhooks for events not covered
    const existingEvents = new Set(targetWebhooks.map(w => w.event));
    const missingEvents = EVENTS.filter(event => !existingEvents.has(event));

    if (missingEvents.length > 0) {
      logger.info({ missingEvents, targetUrl }, 'Creating webhooks for missing events');
      
      retryCount = 0;
      while (retryCount <= maxRetries) {
        try {
          const created = await clockifyClient.createWebhook(CONFIG.WORKSPACE_ID, CONFIG.ADDON_ID, {
            url: targetUrl,
            events: missingEvents
          });
          logger.info({ webhookId: created.id, events: missingEvents, url: targetUrl }, 'Created webhook for missing events');
          existingWebhookIds.push(created.id);
          break;
        } catch (error) {
          if (error instanceof RateLimitError && retryCount < maxRetries) {
            const delayMs = error.retryAfterMs || 1000;
            logger.warn({ retryAfterMs: delayMs, attempt: retryCount + 1 }, 'Rate limited while creating webhook, retrying');
            await sleep(delayMs);
            retryCount++;
          } else {
            throw error;
          }
        }
      }
    }

    // Reconcile: delete unknown webhooks if enabled
    if (webhookReconcile) {
      const unknownWebhooks = webhooks.filter(webhook => 
        webhook.url !== targetUrl && 
        !webhook.url.includes('localhost') // Preserve dev webhooks
      );

      for (const webhook of unknownWebhooks) {
        retryCount = 0;
        while (retryCount <= maxRetries) {
          try {
            await clockifyClient.deleteWebhook(CONFIG.WORKSPACE_ID, CONFIG.ADDON_ID, webhook.id);
            logger.info({ webhookId: webhook.id, url: webhook.url }, 'Deleted unknown webhook during reconciliation');
            break;
          } catch (error) {
            if (error instanceof RateLimitError && retryCount < maxRetries) {
              const delayMs = error.retryAfterMs || 1000;
              logger.warn({ retryAfterMs: delayMs, attempt: retryCount + 1 }, 'Rate limited while deleting webhook, retrying');
              await sleep(delayMs);
              retryCount++;
            } else {
              logger.error({ err: error, webhookId: webhook.id }, 'Failed to delete unknown webhook');
              break; // Continue with other webhooks
            }
          }
        }
      }
    }

    logger.info({ 
      webhookIds: existingWebhookIds, 
      reconcileEnabled: webhookReconcile,
      region: CONFIG.CLOCKIFY_REGION || 'default'
    }, 'Webhook registration completed');
    
    return existingWebhookIds;
  } catch (error) {
    logger.error({ err: error }, 'Failed to ensure webhook registration');
    throw error;
  }
};

// Legacy function for backward compatibility
export const ensureClockifyWebhook = ensureWebhooks;
