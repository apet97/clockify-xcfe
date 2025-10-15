import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { CONFIG } from './config/index.js';
import { logger } from './lib/logger.js';

const startServer = () => {
  const server = http.createServer(app);
  server.listen(CONFIG.PORT, () => {
    logger.info({ port: CONFIG.PORT }, 'xCFE API listening (local dev)');
  });
};

const isProduction = process.env.NODE_ENV === 'production';
const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
const runningDirectly = entryFile ? path.resolve(currentFile) === entryFile : false;

if (!process.env.VERCEL && (runningDirectly || !isProduction)) {
  startServer();
}

export default app;
