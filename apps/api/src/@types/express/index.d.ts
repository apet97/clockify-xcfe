import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
      correlationId?: string;
      originalUrl: string;
      headers: any;
      body: any;
      query: any;
      params: any;
      header(name: string): string | undefined;
    }
    
    interface Response {
      status(code: number): Response;
      json(obj: any): Response;
      send(body?: any): Response;
      setHeader(name: string, value: string): Response;
    }
  }
}

export {};
