import { CONFIG } from '../config/index.js';

const jitter = (base: number) => {
  const variance = base * 0.2;
  return base + (Math.random() * 2 - 1) * variance;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Task<T> = {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  attempt: number;
};

export class RateLimiter {
  private readonly rps: number;
  private readonly maxBackoff: number;
  private readonly maxAttempts: number;
  private readonly queue: Task<unknown>[] = [];
  private lastRun = 0;
  private running = false;

  constructor(options?: { rps?: number; maxBackoffMs?: number; maxAttempts?: number }) {
    this.rps = options?.rps ?? CONFIG.RATE_LIMIT_RPS;
    this.maxBackoff = options?.maxBackoffMs ?? CONFIG.RATE_LIMIT_MAX_BACKOFF_MS;
    this.maxAttempts = options?.maxAttempts ?? 5;
  }

  schedule<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, attempt });
      this.run();
    });
  }

  private async run(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.queue.length) {
      const task = this.queue.shift();
      if (!task) continue;

      const interval = 1000 / this.rps;
      const now = Date.now();
      const elapsed = now - this.lastRun;
      if (elapsed < interval) {
        await sleep(jitter(interval - elapsed));
      }

      this.lastRun = Date.now();
      try {
        const result = await task.fn();
        task.resolve(result);
      } catch (error) {
        const nextAttempt = task.attempt + 1;
        if (nextAttempt >= this.maxAttempts) {
          task.reject(error);
        } else {
          const intervalMs = 1000 / this.rps;
          const retryAfter = typeof error === 'object' && error && 'retryAfterMs' in error
            ? Number((error as { retryAfterMs?: number }).retryAfterMs)
            : undefined;
          const calculated = intervalMs * Math.pow(2, nextAttempt);
          const backoff = Math.min(this.maxBackoff, retryAfter && !Number.isNaN(retryAfter) ? retryAfter : calculated);
          await sleep(jitter(backoff));
          this.queue.push({ ...task, attempt: nextAttempt });
        }
      }
    }

    this.running = false;
  }
}

export const rateLimiter = new RateLimiter();
