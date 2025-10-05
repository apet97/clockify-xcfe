import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';

export const httpLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const correlationId = req.headers['x-correlation-id'] as string || randomUUID();
  
  // Attach correlation ID to request for use in handlers
  req.correlationId = correlationId;
  
  // Set correlation ID header for responses
  res.setHeader('X-Correlation-Id', correlationId);
  
  // Create request logger with correlation ID
  req.logger = logger.child({ correlationId });
  
  // Log incoming request
  req.logger.info({
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  }, 'HTTP request');
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - start;
    
    req.logger.info({
      res: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        duration
      }
    }, 'HTTP response');
    
    // Call original end method
    originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};