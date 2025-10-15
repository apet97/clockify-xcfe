import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('@api/lib/db.js', () => ({
  getDb: vi.fn(() => ({ connect: vi.fn(async () => ({ query: vi.fn(async () => ({ rows: [{ table_count: 5 }] })), release: vi.fn() })) }))
}));

vi.mock('@api/lib/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

const { healthCheck } = await import('@api/controllers/healthController.js');

describe('healthController.healthCheck', () => {
  it('returns status and workspaceId', async () => {
    const req = {} as unknown as Request;
    const res = { json: vi.fn() } as unknown as Response;
    await healthCheck(req, res);
    const payload = (res.json as any).mock.calls[0][0];
    expect(payload).toHaveProperty('status');
    expect(payload).toHaveProperty('workspaceId');
    expect(['healthy','degraded']).toContain(payload.status);
  });
});

