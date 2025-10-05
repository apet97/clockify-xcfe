import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import routes from './routes/index.js';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { CONFIG } from './config/index.js';

const rawBodySaver = (req: Request, _res: Response, buf: Buffer) => {
  if (buf && req.originalUrl?.startsWith('/v1/webhooks')) {
    req.rawBody = buf.toString('utf8');
  }
};

export const createApp = () => {
  const app = express();

  app.set('trust proxy', true);

  app.use(cors({
    origin: CONFIG.ADMIN_UI_ORIGIN ?? '*',
    credentials: true
  }));

  app.use(express.json({ verify: rawBodySaver }));
  app.use(express.urlencoded({ extended: true }));
  app.use(correlationMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: req => req.correlationId ?? (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID(),
      customProps: req => ({ correlationId: req.correlationId })
    })
  );

  app.get('/', (_req, res) => {
    res.json({ name: 'xCustom Field Expander API', version: '0.1.0' });
  });

  app.use('/v1', routes);
  app.use(errorHandler);

  return app;
};
