import http from 'node:http';
import { CONFIG } from './config/index.js';
import { logger } from './lib/logger.js';
import { ensureClockifyWebhook } from './services/webhookRegistrar.js';
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

  await ensureSchema().catch(error => {
    logger.error({ err: error }, 'database schema verification failed');
    throw error;
  });

  await ensureClockifyWebhook().catch(error => {
    logger.warn({ err: error }, 'Continuing startup despite webhook bootstrap failure');
  });

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
