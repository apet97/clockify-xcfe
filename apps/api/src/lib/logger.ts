import pino from 'pino';
import { CONFIG } from '../config/index.js';

const { NODE_ENV } = CONFIG;

export const logger = pino({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  base: undefined
});
