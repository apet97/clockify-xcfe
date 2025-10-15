import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@api/config/index.js', () => ({
  CONFIG: {
    ADDON_KEY: 'xcfe.example'
  }
}));

vi.mock('@api/lib/jwt.js', () => ({
  verifyClockifyJwt: vi.fn()
}));

vi.mock('@api/services/settingsService.js', () => ({
  getWorkspaceSettings: vi.fn(),
  updateWorkspaceSettings: vi.fn()
}));

const { verifyClockifyJwt } = await import('@api/lib/jwt.js');
const { getWorkspaceSettings, updateWorkspaceSettings } = await import('@api/services/settingsService.js');
const { getSettings, updateSettings } = await import('@api/controllers/settingsController.js');

const createRequest = (options: { header?: string | null; queryToken?: string | null; body?: unknown } = {}) => {
  const { header, queryToken, body } = options;

  const req: Partial<Request> = {
    header: (name: string) => {
      if (name.toLowerCase() === 'authorization' && header) {
        return header;
      }
      return undefined;
    },
    query: queryToken ? { auth_token: queryToken } : {},
    body,
    correlationId: 'test-correlation'
  };

  return req as Request;
};

const createResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockImplementation(() => res as Response);
  res.json = vi.fn().mockImplementation(() => res as Response);
  return res as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

describe('settingsController authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('accepts bearer token for GET /v1/settings', async () => {
    vi.mocked(verifyClockifyJwt).mockResolvedValue({ workspaceId: 'ws-1' } as any);
    vi.mocked(getWorkspaceSettings).mockResolvedValue({
      workspace_id: 'ws-1',
      strict_mode: true,
      reference_months: 6,
      region: 'use2',
      formulas: []
    });

    const req = createRequest({ header: 'Bearer header-token' });
    const res = createResponse();

    await getSettings(req, res);

    expect(verifyClockifyJwt).toHaveBeenCalledWith('header-token', 'xcfe.example');
    expect(getWorkspaceSettings).toHaveBeenCalledWith('ws-1');
    expect(res.json).toHaveBeenCalledWith({
      strict_mode: true,
      reference_months: 6,
      region: 'use2',
      formulas: []
    });
  });

  it('falls back to auth_token query parameter when header missing', async () => {
    vi.mocked(verifyClockifyJwt).mockResolvedValue({ workspaceId: 'ws-1' } as any);
    vi.mocked(getWorkspaceSettings).mockResolvedValue({
      workspace_id: 'ws-1',
      strict_mode: false,
      reference_months: 3,
      region: null,
      formulas: []
    });

    const req = createRequest({ queryToken: 'query-token' });
    const res = createResponse();

    await getSettings(req, res);

    expect(verifyClockifyJwt).toHaveBeenCalledWith('query-token', 'xcfe.example');
    expect(getWorkspaceSettings).toHaveBeenCalledWith('ws-1');
    expect(res.json).toHaveBeenCalledWith({
      strict_mode: false,
      reference_months: 3,
      region: undefined,
      formulas: []
    });
  });

  it('returns 401 when authentication missing', async () => {
    const req = createRequest();
    const res = createResponse();

    await getSettings(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing authentication token' });
  });

  it('accepts bearer token for POST /v1/settings', async () => {
    vi.mocked(verifyClockifyJwt).mockResolvedValue({ workspaceId: 'ws-2' } as any);
    vi.mocked(updateWorkspaceSettings).mockResolvedValue();

    const req = createRequest({
      header: 'Bearer header-token',
      body: {
        strict_mode: true,
        reference_months: 4,
        formulas: [
          { targetId: 'cf_1', expr: 'hours * rate' }
        ]
      }
    });
    const res = createResponse();

    await updateSettings(req, res);

    expect(verifyClockifyJwt).toHaveBeenCalledWith('header-token', 'xcfe.example');
    expect(updateWorkspaceSettings).toHaveBeenCalledWith('ws-2', {
      strict_mode: true,
      reference_months: 4,
      formulas: [
        { targetId: 'cf_1', expr: 'hours * rate' }
      ]
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
