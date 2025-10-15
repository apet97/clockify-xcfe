import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { CONFIG } from '../config/index.js';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

const deriveKey = () => {
  const hash = createHash('sha256');
  hash.update(CONFIG.ENCRYPTION_KEY);
  return hash.digest();
};

export type CipherPayload = {
  iv: string;
  authTag: string;
  content: string;
};

export const encrypt = (plaintext: string): CipherPayload => {
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey();
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    content: encrypted.toString('base64')
  };
};

export const decrypt = (payload: CipherPayload): string => {
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
};
