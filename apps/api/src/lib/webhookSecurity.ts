import { createHmac } from 'node:crypto';
import { CONFIG } from '../config/index.js';

export const verifyClockifySignature = (rawBody: string, signatureHeader?: string | null): boolean => {
  if (CONFIG.DEV_ALLOW_UNSIGNED && CONFIG.NODE_ENV === 'development') return true;
  if (!CONFIG.CLOCKIFY_WEBHOOK_SECRET) return true;
  if (!signatureHeader) return false;
  const [scheme, signature] = signatureHeader.split('=', 2);
  if (!scheme || !signature || scheme !== 'sha256') return false;

  const computed = createHmac('sha256', CONFIG.CLOCKIFY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return timingSafeEquals(computed, signature);
};

const timingSafeEquals = (a: string, b: string) => {
  const buffA = Buffer.from(a, 'utf8');
  const buffB = Buffer.from(b, 'utf8');
  if (buffA.length !== buffB.length) return false;
  return Buffer.compare(buffA, buffB) === 0;
};
