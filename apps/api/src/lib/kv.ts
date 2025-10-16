/**
 * In-memory cache for MVP (temporary - no persistence across serverless instances)
 * Used for JWT replay protection and webhook deduplication
 *
 * WARNING: This cache will be lost on cold starts. For production, use Upstash Redis.
 */
import { CONFIG } from '../config/index.js';
import { logger } from './logger.js';

type CacheCell = { v: string; exp: number };
const memStore = new Map<string, CacheCell>();

// Cleanup expired entries only in non-serverless environments
// Serverless functions should not have long-running intervals
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, cell] of memStore.entries()) {
      if (cell.exp < now) {
        memStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check if a key has been seen before, and mark it as seen if not.
 * Returns true if the key was already seen (within TTL), false if this is the first time.
 *
 * Uses Redis SET with NX (set if not exists) and EX (expiry in seconds).
 *
 * @param key - Unique key to check/set
 * @param ttlSec - Time-to-live in seconds
 * @returns true if already seen, false if first time
 */
export async function seenOnce(key: string, ttlSec: number): Promise<boolean> {
  const now = Date.now();
  const cell = memStore.get(key);

  // Check if key exists and hasn't expired
  if (cell && cell.exp > now) {
    logger.debug({ key, ttlSec }, 'Key already seen in memory cache');
    return true; // Already seen
  }

  // Mark as seen with expiry
  memStore.set(key, { v: '1', exp: now + ttlSec * 1000 });
  logger.debug({ key, ttlSec }, 'Key marked as seen in memory cache');
  return false; // First time
}

/**
 * Get a value from KV cache
 * @param key - Key to retrieve
 * @returns The cached value or null if not found
 */
export async function getFromCache<T = string>(key: string): Promise<T | null> {
  const now = Date.now();
  const cell = memStore.get(key);

  if (!cell || cell.exp < now) {
    return null;
  }

  try {
    return JSON.parse(cell.v) as T;
  } catch {
    return cell.v as T;
  }
}

/**
 * Set a value in KV cache with optional TTL
 * @param key - Key to set
 * @param value - Value to store
 * @param ttlSec - Optional time-to-live in seconds
 */
export async function setInCache(key: string, value: string | number | object, ttlSec = 3600): Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const now = Date.now();
  memStore.set(key, { v: serialized, exp: now + ttlSec * 1000 });
}

/**
 * Delete a key from KV cache
 * @param key - Key to delete
 */
export async function deleteFromCache(key: string): Promise<void> {
  memStore.delete(key);
}
