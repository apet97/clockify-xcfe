import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

const getErrorDetails = (err: unknown) => {
  if (err instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    };
  }

  if (err && typeof err === 'object' && 'status' in err) {
    const appErr = err as AppError;
    return {
      status: appErr.status || 500,
      code: appErr.code || 'APPLICATION_ERROR',
      message: appErr.message || 'Internal Server Error',
      details: appErr.details
    };
  }

  if (err instanceof Error) {
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal Server Error'
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  };
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const errorDetails = getErrorDetails(err);
  
  logger.error({ 
    err, 
    errorDetails,
    path: req.path, 
    method: req.method,
    correlationId: req.correlationId 
  }, 'HTTP error');

  res.status(errorDetails.status).json({
    error: {
      code: errorDetails.code,
      message: errorDetails.message,
      details: errorDetails.details,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    }
  });
};
