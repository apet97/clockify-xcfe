import type { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err, path: req.path, correlationId: req.correlationId }, 'unhandled error');
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: err?.message ?? 'Internal Server Error',
    correlationId: req.correlationId
  });
};
