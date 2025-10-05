import pino from 'pino';
import { CONFIG } from '../config/index.js';

const isDev = CONFIG.NODE_ENV === 'development';
const logLevel = CONFIG.LOG_LEVEL || (CONFIG.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = pino({
  level: logLevel,
  base: {
    pid: process.pid,
    env: CONFIG.NODE_ENV
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      // Redact sensitive headers and data
      if (object.req?.headers) {
        const headers = { ...object.req.headers };
        if (headers.authorization) headers.authorization = '[REDACTED]';
        if (headers['x-api-key']) headers['x-api-key'] = '[REDACTED]';
        if (headers['x-addon-token']) headers['x-addon-token'] = '[REDACTED]';
        object.req.headers = headers;
      }
      return object;
    }
  },
  transport: isDev ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined
});
