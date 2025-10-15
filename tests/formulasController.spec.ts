import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('@api/lib/jwt.js', () => ({
  verifyClockifyJwt: vi.fn()
}));

vi.mock('@api/services/installationService.js', () => ({
  getInstallation: vi.fn()
}));

vi.mock('@api/lib/clockifyClient.js', () => ({
  clockifyClient: {
    getDetailedReport: vi.fn(),
    patchTimeEntryCustomFields: vi.fn(),
    getTimeEntry: vi.fn()
  }
}));

vi.mock('@api/lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

const { verifyClockifyJwt } = await import('@api/lib/jwt.js');
const { getInstallation } = await import('@api/services/installationService.js');
const { clockifyClient } = await import('@api/lib/clockifyClient.js');
const { recompute, verify } = await import('@api/controllers/formulasController.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('formulasController.recompute', () => {
  it('forwards installation token to patchTimeEntryCustomFields and uses reportsUrl override', async () => {
    vi.mocked(verifyClockifyJwt).mockResolvedValue({
      addonId: 'addon-1',
      workspaceId: 'ws-1',
      backendUrl: 'https://use2-api.clockify.me/api/v1',
      reportsUrl: 'https://use2-reports.api.clockify.me/v1',
      userId: 'u-1',
      type: 'addon',
      sub: 'xcfe',
      iss: 'clockify',
      exp: Math.floor(Date.now()/1000)+600,
      iat: Math.floor(Date.now()/1000)
    } as any);

    vi.mocked(getInstallation).mockResolvedValue({ installationToken: 'install-token' } as any);

    vi.mocked(clockifyClient.getDetailedReport).mockResolvedValue({
      timeEntries: [ { id: 't1', duration: 3600 } ],
      totals: []
    } as any);

    const req = {
      query: { auth_token: 'jwt' },
      body: { startDate: new Date().toISOString(), endDate: new Date().toISOString() },
      correlationId: 'c-1'
    } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;

    process.env.CF_CALC_HOURS_ID = 'calc-hours';

    await recompute(req, res);

    // Ensure Detailed Report called with override + token
    expect(clockifyClient.getDetailedReport).toHaveBeenCalled();
    const drArgs = (clockifyClient.getDetailedReport as any).mock.calls[0];
    expect(drArgs[2]).toBe('c-1'); // correlationId
    expect(drArgs[3]).toBe('install-token'); // authToken
    expect(drArgs[4]).toBe('https://use2-reports.api.clockify.me/v1'); // override

    // Ensure patch used installation token
    expect(clockifyClient.patchTimeEntryCustomFields).toHaveBeenCalledWith(
      'ws-1',
      't1',
      expect.any(Object),
      expect.objectContaining({ authToken: 'install-token' })
    );
  });
});

describe('formulasController.verify', () => {
  it('requires installation token and passes it to getTimeEntry', async () => {
    vi.mocked(verifyClockifyJwt).mockResolvedValue({
      addonId: 'addon-1',
      workspaceId: 'ws-1',
      backendUrl: 'https://use2-api.clockify.me/api/v1',
      type: 'addon', sub: 'xcfe', iss: 'clockify', exp: 0, iat: 0
    } as any);

    // First call returns no installation -> 401
    vi.mocked(getInstallation).mockResolvedValueOnce(null as any);

    let req = { query: { auth_token: 'jwt', entryId: 't1' }, correlationId: 'c-2' } as unknown as Request;
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
    await verify(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    // Second call returns token -> should call getTimeEntry with token
    vi.mocked(getInstallation).mockResolvedValueOnce({ installationToken: 'install-token' } as any);
    req = { query: { auth_token: 'jwt', entryId: 't1' }, correlationId: 'c-3' } as unknown as Request;
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;

    await verify(req, res);
    expect(clockifyClient.getTimeEntry).toHaveBeenCalledWith('ws-1', 't1', 'c-3', 'install-token', expect.stringContaining('https://use2-api.clockify.me/api/v1'.replace(/\/$/, '') + '/v1'));
  });

  it('rejects JWTs with mismatched subject', async () => {
    vi.mocked(verifyClockifyJwt).mockRejectedValue(new Error('Invalid JWT subject'));
    const req = { query: { auth_token: 'bad', entryId: 'x' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
    await verify(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
