import { CONFIG } from '../config/index.js';
import { clockifyClient } from '../lib/clockifyClient.js';
import { logger } from '../lib/logger.js';

const EVENTS = ['NEW_TIME_ENTRY', 'NEW_TIMER_STARTED', 'TIME_ENTRY_UPDATED', 'TIME_ENTRY_DELETED', 'BILLABLE_RATE_UPDATED'];

export const ensureClockifyWebhook = async () => {
  if (!CONFIG.ADDON_ID || !CONFIG.WEBHOOK_PUBLIC_URL) {
    logger.warn('Skipping webhook bootstrap because ADDON_ID or WEBHOOK_PUBLIC_URL is missing');
    return;
  }

  const targetUrl = new URL('/v1/webhooks/clockify', CONFIG.WEBHOOK_PUBLIC_URL).toString();
  try {
    const webhooks = await clockifyClient.listWebhooks(CONFIG.WORKSPACE_ID, CONFIG.ADDON_ID);
    const existing = webhooks.find((item) => item.url === targetUrl);
    if (existing) {
      logger.info({ webhookId: existing.id }, 'Clockify webhook already registered');
      return;
    }
    const created = await clockifyClient.createWebhook(CONFIG.WORKSPACE_ID, CONFIG.ADDON_ID, {
      url: targetUrl,
      events: EVENTS
    });
    logger.info({ webhookId: created.id, url: targetUrl }, 'Registered Clockify webhook');
  } catch (error) {
    logger.error({ err: error }, 'Failed to ensure webhook registration');
    throw error;
  }
};
