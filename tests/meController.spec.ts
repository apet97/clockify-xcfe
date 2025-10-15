import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('@api/lib/jwt.js', () => ({
  verifyClockifyJwt: vi.fn()
}));

vi.mock('@api/lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

const { verifyClockifyJwt } = await import('@api/lib/jwt.js');
const { getMe } = await import('@api/controllers/meController.js');

describe('meController.getMe', () => {
  it('rejects JWTs with mismatched subject (addon key)', async () => {
    vi.mocked(verifyClockifyJwt).mockRejectedValue(new Error('Invalid JWT subject, expected "expected", got "other"'));

    const req = { query: { auth_token: 'bad-token' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid authentication token' }));
  });
});

