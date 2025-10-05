import 'express';

declare module 'express' {
  interface Request {
    rawBody?: string;
    correlationId?: string;
  }
}
