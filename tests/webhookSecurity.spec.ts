import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyClockifySignature } from '@api/lib/webhookSecurity.js';
import { createHmac } from 'node:crypto';

// Mock config
vi.mock('@api/config/index.js', () => ({
  CONFIG: {
    CLOCKIFY_WEBHOOK_SECRET: 'test-secret-key',
    DEV_ALLOW_UNSIGNED: false,
    NODE_ENV: 'test'
  }
}));

describe('verifyClockifySignature', () => {
  const testPayload = '{"test": "data"}';
  const testSecret = 'test-secret-key';
  
  const createValidSignature = (payload: string, secret: string) => {
    const hash = createHmac('sha256', secret).update(payload).digest('hex');
    return `sha256=${hash}`;
  };

  it('should verify valid signatures', () => {
    const validSignature = createValidSignature(testPayload, testSecret);
    expect(verifyClockifySignature(testPayload, validSignature)).toBe(true);
  });

  it('should reject invalid signatures', () => {
    const invalidSignature = 'sha256=invalid-hash';
    expect(verifyClockifySignature(testPayload, invalidSignature)).toBe(false);
  });

  it('should reject malformed signature headers', () => {
    expect(verifyClockifySignature(testPayload, 'invalid-format')).toBe(false);
    expect(verifyClockifySignature(testPayload, 'md5=somehash')).toBe(false);
    expect(verifyClockifySignature(testPayload, '=')).toBe(false);
  });

  it('should reject missing signature headers', () => {
    expect(verifyClockifySignature(testPayload, null)).toBe(false);
    expect(verifyClockifySignature(testPayload, undefined)).toBe(false);
    expect(verifyClockifySignature(testPayload, '')).toBe(false);
  });

  it('should handle timing attacks with different length signatures', () => {
    const shortSignature = 'sha256=short';
    const longSignature = 'sha256=' + 'a'.repeat(100);
    
    expect(verifyClockifySignature(testPayload, shortSignature)).toBe(false);
    expect(verifyClockifySignature(testPayload, longSignature)).toBe(false);
  });

  it('should be case sensitive for scheme', () => {
    const hash = createHmac('sha256', testSecret).update(testPayload).digest('hex');
    const upperCaseSignature = `SHA256=${hash}`;
    expect(verifyClockifySignature(testPayload, upperCaseSignature)).toBe(false);
  });

  it('should handle modified payload attacks', () => {
    const originalPayload = '{"amount": 100}';
    const modifiedPayload = '{"amount": 999}';
    const validSignature = createValidSignature(originalPayload, testSecret);
    
    expect(verifyClockifySignature(modifiedPayload, validSignature)).toBe(false);
  });

  it('should handle Unicode and special characters', () => {
    const unicodePayload = '{"emoji": "🔒", "special": "áéíóú"}';
    const validSignature = createValidSignature(unicodePayload, testSecret);
    
    expect(verifyClockifySignature(unicodePayload, validSignature)).toBe(true);
  });
});