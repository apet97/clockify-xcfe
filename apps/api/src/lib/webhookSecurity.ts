import { createHmac, timingSafeEqual } from 'node:crypto';
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

const HEX_REGEX = /^[0-9a-f]+$/i;

const timingSafeEquals = (expectedHex: string, receivedHex: string) => {
  const normalizedExpected = expectedHex.toLowerCase();
  const normalizedReceived = receivedHex.toLowerCase();

  if (
    normalizedExpected.length !== normalizedReceived.length ||
    normalizedExpected.length % 2 !== 0 ||
    !HEX_REGEX.test(normalizedExpected) ||
    !HEX_REGEX.test(normalizedReceived)
  ) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(normalizedExpected, 'hex');
    const receivedBuffer = Buffer.from(normalizedReceived, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
};
