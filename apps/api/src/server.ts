import app from './app.js';
import { CONFIG } from './config/index.js';
import { logger } from './lib/logger.js';
import http from 'node:http';

if (require.main === module || process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  server.listen(CONFIG.PORT, () => {
    logger.info({ port: CONFIG.PORT }, 'xCFE API listening (local dev)');
  });
}
