import http from 'node:http';
import { CONFIG } from './config/index.js';
import { logger } from './lib/logger.js';
import { ensureWebhooks } from './services/webhookRegistrar.js';
import { createApp } from './app.js';
import { ensureSchema } from './lib/db.js';

const summarizeEnv = () => ({
  nodeEnv: CONFIG.NODE_ENV,
  port: CONFIG.PORT,
  workspaceId: CONFIG.WORKSPACE_ID,
  baseUrl: CONFIG.CLOCKIFY_BASE_URL,
  region: CONFIG.CLOCKIFY_REGION ?? 'default',
  adminUiOrigin: CONFIG.ADMIN_UI_ORIGIN ?? 'not-set'
});

export const start = async () => {
  const app = createApp();

  // Conditionally skip database checks for addon development
  if (!CONFIG.SKIP_DATABASE_CHECKS) {
    await ensureSchema().catch(error => {
      logger.error({ err: error }, 'database schema verification failed');
      throw error;
    });
  } else {
    logger.info('Skipping database checks for addon development mode');
  }

  // Skip webhook registration for addon development  
  const webhookIds: string[] = [];
  if (!CONFIG.SKIP_DATABASE_CHECKS) {
    // Only register webhooks if we have database connectivity
    // const webhookIds = await ensureWebhooks().catch(error => {
    //   logger.warn({ err: error }, 'Continuing startup despite webhook bootstrap failure');
    //   return [];
    // });
  }

  if (webhookIds.length > 0) {
    logger.info({ webhookIds }, 'Webhook registration completed successfully');
  }

  const server = http.createServer(app);
  server.listen(CONFIG.PORT, () => {
    logger.info({ env: summarizeEnv() }, 'xCFE API listening');
  });

  return server;
};

if (process.env.NODE_ENV !== 'test') {
  start().catch(error => {
    logger.error({ err: error }, 'Failed to start server');
    process.exitCode = 1;
  });
}
