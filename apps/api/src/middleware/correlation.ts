import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerId = req.header('x-correlation-id');
  const correlationId = headerId ?? randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};
