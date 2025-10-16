import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { CONFIG } from './config/index.js';
import { logger } from './lib/logger.js';
import { ensureWebhooks } from './services/webhookRegistrar.js';

const startServer = () => {
  const server = http.createServer(app);
  server.listen(CONFIG.PORT, () => {
    logger.info({ port: CONFIG.PORT }, 'xCFE API listening (local dev)');
    // Best-effort webhook bootstrap when env is configured
    (async () => {
      try {
        await ensureWebhooks();
      } catch (err) {
        logger.warn({ err }, 'Webhook bootstrap skipped or failed');
      }
    })();
  });
};

const isProduction = process.env.NODE_ENV === 'production';
const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
const runningDirectly = entryFile ? path.resolve(currentFile) === entryFile : false;

if (!process.env.VERCEL && (runningDirectly || !isProduction)) {
  startServer();
}

// Export for Vercel serverless (both default and named)
export default app;
export const handler = app;
