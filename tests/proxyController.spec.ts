import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { proxyTimeEntries } from '../apps/api/src/controllers/proxyController.js';
import * as jwtLib from '../apps/api/src/lib/jwt.js';
import * as installationService from '../apps/api/src/services/installationService.js';
import { CONFIG } from '../apps/api/src/config/index.js';

// Mock modules
vi.mock('../apps/api/src/lib/jwt.js');
vi.mock('../apps/api/src/services/installationService.js');
vi.mock('../apps/api/src/lib/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn()
  }
}));

describe('proxyController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;
  let setSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    jsonSpy = vi.fn().mockReturnThis();
    statusSpy = vi.fn().mockReturnThis();
    setSpy = vi.fn().mockReturnThis();

    mockReq = {
      query: {},
      correlationId: 'test-correlation-id'
    };

    mockRes = {
      json: jsonSpy,
      status: statusSpy,
      set: setSpy
    };
  });

  describe('proxyTimeEntries', () => {
    it('returns 403 when no credentials exist (prod)', async () => {
      const originalNodeEnv = CONFIG.NODE_ENV;
      const originalAddonToken = CONFIG.ADDON_TOKEN;
      const originalApiKey = CONFIG.API_KEY;

      try {
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: 'production', writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: undefined, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: undefined, writable: true, configurable: true });

        mockReq.query = { start: '2025-01-01T00:00:00Z', end: '2025-01-02T00:00:00Z' };

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        expect(statusSpy).toHaveBeenCalledWith(403);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Authentication required for this operation',
            correlationId: 'test-correlation-id'
          })
        );
      } finally {
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: originalNodeEnv, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: originalApiKey, writable: true, configurable: true });
      }
    });

    it('returns 401 when JWT verification fails', async () => {
      const originalNodeEnv = CONFIG.NODE_ENV;

      try {
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: 'production', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'invalid-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockRejectedValue(new Error('Invalid JWT'));

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Invalid or expired authentication token',
            correlationId: 'test-correlation-id'
          })
        );
      } finally {
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: originalNodeEnv, writable: true, configurable: true });
      }
    });

    it('should return 400 if start or end parameters are missing', async () => {
      mockReq.query = {
        auth_token: 'valid-token',
        start: '2025-01-01T00:00:00Z'
        // missing 'end'
      };

      vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
        workspaceId: 'ws-123',
        userId: 'user-123',
        backendUrl: 'https://api.clockify.me/api/v1'
      } as any);

      await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing start or end parameters'
        })
      );
    });

    it('uses claims-only flow: with valid claims, fetch first arg is expect.any(URL) and includes user-scoped path', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'global-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          addonId: 'addon-789',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        vi.mocked(installationService.getInstallation).mockResolvedValue(null);

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => [{ id: 'entry-1' }]
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify URL construction uses claims only (no query params)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(URL),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Addon-Token': 'global-token' // Uses global token since no installation token
            })
          })
        );

        const calledUrl = (vi.mocked(global.fetch) as any).mock.calls[0][0] as URL;
        expect(calledUrl).toBeInstanceOf(URL);
        expect(String(calledUrl)).toContain('/v1/workspaces/ws-123/user/user-456/time-entries');
        expect(String(calledUrl)).not.toContain('workspaceId=');
        expect(String(calledUrl)).not.toContain('userId=');
        expect(String(calledUrl)).not.toContain('auth_token');
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('installation token takes precedence over env ADDON_TOKEN', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;
      const originalNodeEnv = CONFIG.NODE_ENV;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'env-token', writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: 'production', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-555',
          userId: 'user-999',
          addonId: 'addon-abc',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // Simulate DB token present and must take precedence over env ADDON_TOKEN
        vi.mocked(installationService.getInstallation).mockResolvedValue({
          installationToken: 'db-token',
          addonId: 'addon-abc',
          workspaceId: 'ws-555'
        } as any);

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => []
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        const args = (vi.mocked(global.fetch) as any).mock.calls[0];
        expect(args[0]).toBeInstanceOf(URL);
        expect(args[1].headers['X-Addon-Token']).toBe('db-token'); // Installation token takes precedence
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: originalNodeEnv, writable: true, configurable: true });
      }
    });

    it('should use global ADDON_TOKEN when iframe JWT provided but no installation token (Priority 1)', async () => {
      // Save original values
      const originalNodeEnv = CONFIG.NODE_ENV;
      const originalAddonToken = CONFIG.ADDON_TOKEN;
      const originalApiKey = CONFIG.API_KEY;

      try {
        // Set production mode with global credentials
        Object.defineProperty(CONFIG, 'NODE_ENV', {
          value: 'production',
          writable: true,
          configurable: true
        });
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'global-token', writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: undefined, writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-123',
          addonId: 'addon-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        vi.mocked(installationService.getInstallation).mockResolvedValue(null);

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: (_: string) => 'application/json' },
          json: async () => [{ id: 'entry-1' }]
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify global ADDON_TOKEN was used when no installation token available
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(URL),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Addon-Token': 'global-token'
            })
          })
        );
        expect(jsonSpy).toHaveBeenCalledWith([{ id: 'entry-1' }]);
        expect(statusSpy).not.toHaveBeenCalled();
      } finally {
        // Restore original values
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: originalNodeEnv, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: originalApiKey, writable: true, configurable: true });
      }
    });


    it('forwards 429 with Retry-After and message snippet', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'test-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'valid-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (name: string) => (name === 'Retry-After' ? '60' : null)
          },
          text: async () => 'Rate limit exceeded'
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        expect(statusSpy).toHaveBeenCalledWith(429);
        expect(setSpy).toHaveBeenCalledWith('Retry-After', '60');
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({ status: 429, retryAfter: '60', message: expect.stringContaining('Rate limit exceeded') })
        );
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('passes through 401/403 with upstream body snippet', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'test-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'valid-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: {
            get: () => null
          },
          text: async () => 'Invalid token'
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 401, message: expect.stringContaining('Invalid token') }));
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('should successfully proxy time entries with installation token (Priority 1)', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        // Set a global token, but installation token should take priority
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'global-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-123',
          addonId: 'addon-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // Installation token should take precedence over global token
        vi.mocked(installationService.getInstallation).mockResolvedValue({
          installationToken: 'installation-token',
          addonId: 'addon-123',
          workspaceId: 'ws-123'
        } as any);

        const mockEntries = [
          { id: 'entry-1', description: 'Work 1' },
          { id: 'entry-2', description: 'Work 2' }
        ];

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => mockEntries
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify installation token is used (Priority 1) instead of global token
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(URL),
          expect.objectContaining({
            headers: expect.objectContaining({ 'X-Addon-Token': 'installation-token' })
          })
        );

        // Verify URL form (user-scoped) and no token leakage in URL
        const calledUrl = (vi.mocked(global.fetch) as any).mock.calls[0][0] as URL;
        expect(calledUrl).toBeInstanceOf(URL);
        expect(String(calledUrl)).toContain('/v1/workspaces/ws-123/user/user-123/time-entries');
        expect(calledUrl.search).toContain('start=');
        expect(calledUrl.search).toContain('end=');
        expect(calledUrl.search).not.toContain('auth_token');

        expect(jsonSpy).toHaveBeenCalledWith(mockEntries);
        expect(statusSpy).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('falls back to installation token before env tokens in development mode', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;
      const originalApiKey = CONFIG.API_KEY;
      const originalNodeEnv = CONFIG.NODE_ENV;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'env-token', writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: undefined, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: 'development', writable: true, configurable: true });

        mockReq.query = {
          // no auth_token provided
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z',
          workspaceId: 'ws-555',
          userId: 'user-999',
          addonId: 'addon-abc'
        } as any;

        // Simulate DB token present and must take precedence over env ADDON_TOKEN
        vi.mocked(installationService.getInstallation).mockResolvedValue({
          installationToken: 'db-token',
          addonId: 'addon-abc',
          workspaceId: 'ws-555'
        } as any);

        // Simulate upstream OK
        global.fetch = vi.fn().mockResolvedValue({ ok: true, headers: { get: () => 'application/json' }, json: async () => [] } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        const args = (vi.mocked(global.fetch) as any).mock.calls[0];
        expect(args[0]).toBeInstanceOf(URL);
        expect(args[1].headers['X-Addon-Token']).toBe('db-token');
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: originalApiKey, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'NODE_ENV', { value: originalNodeEnv, writable: true, configurable: true });
      }
    });

    it('returns 502 on upstream fetch error', async () => {
      mockReq.query = {
        auth_token: 'token',
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-02T00:00:00Z'
      } as any;
      vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'u-1',
        backendUrl: 'https://api.clockify.me/api/'
      } as any);

      (global.fetch as any) = vi.fn().mockRejectedValue(new Error('network down'));

      await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

      expect(statusSpy).toHaveBeenCalledWith(502);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Clockify upstream error' }));
    });

    it('returns 502 when upstream responds OK with non-JSON content', async () => {
      mockReq.query = {
        auth_token: 'iframe-jwt',
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-02T00:00:00Z'
      } as any;

      vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'u-1',
        backendUrl: 'https://api.clockify.me/api/v1'
      } as any);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: (_: string) => 'text/html' },
        json: async () => ({})
      } as Response);

      await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

      expect(statusSpy).toHaveBeenCalledWith(502);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unexpected upstream content-type' }));
    });

    it('falls back to legacy URL when user-scoped endpoint returns 404', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'test-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // First call to user-scoped endpoint returns 404
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: false,
            status: 404,
            headers: { get: () => null },
            text: async () => 'Not found'
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            headers: { get: () => 'application/json' },
            json: async () => [{ id: 'entry-1' }]
          } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify two fetch calls were made
        expect(global.fetch).toHaveBeenCalledTimes(2);
        
        const firstCallUrl = (vi.mocked(global.fetch) as any).mock.calls[0][0] as URL;
        const secondCallUrl = (vi.mocked(global.fetch) as any).mock.calls[1][0] as URL;
        
        expect(String(firstCallUrl)).toContain('/v1/workspaces/ws-123/user/user-456/time-entries');
        expect(String(secondCallUrl)).toContain('/v1/workspaces/ws-123/time-entries?userId=user-456');
        
        expect(jsonSpy).toHaveBeenCalledWith([{ id: 'entry-1' }]);
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('falls back to legacy URL when user-scoped endpoint returns 405', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'test-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // First call to user-scoped endpoint returns 405
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: false,
            status: 405,
            headers: { get: () => null },
            text: async () => 'Method not allowed'
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            headers: { get: () => 'application/json' },
            json: async () => [{ id: 'entry-1' }]
          } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify two fetch calls were made
        expect(global.fetch).toHaveBeenCalledTimes(2);
        
        const firstCallUrl = (vi.mocked(global.fetch) as any).mock.calls[0][0] as URL;
        const secondCallUrl = (vi.mocked(global.fetch) as any).mock.calls[1][0] as URL;
        
        expect(String(firstCallUrl)).toContain('/v1/workspaces/ws-123/user/user-456/time-entries');
        expect(String(secondCallUrl)).toContain('/v1/workspaces/ws-123/time-entries?userId=user-456');
        
        expect(jsonSpy).toHaveBeenCalledWith([{ id: 'entry-1' }]);
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('returns 502 when upstream responds with non-JSON content-type', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'test-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: () => 'text/html' }, // Non-JSON content type
          json: async () => ({})
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        expect(statusSpy).toHaveBeenCalledWith(502);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Unexpected upstream content-type'
          })
        );
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });

    it('NEGATIVE: never forwards iframe auth_token as X-Addon-Token upstream', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;
      const originalApiKey = CONFIG.API_KEY;

      try {
        // Explicitly clear all server-side credentials
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: undefined, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: undefined, writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token-should-never-be-forwarded',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          addonId: 'addon-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // No installation token available
        vi.mocked(installationService.getInstallation).mockResolvedValue(null);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Should return 403 because no server-side credentials exist
        expect(statusSpy).toHaveBeenCalledWith(403);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Clockify credentials are not configured for this installation'
          })
        );

        // Verify fetch was never called (since no credentials available)
        expect(global.fetch).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
        Object.defineProperty(CONFIG, 'API_KEY', { value: originalApiKey, writable: true, configurable: true });
      }
    });

    it('POSITIVE: uses server-side token even when iframe token is present', async () => {
      const originalAddonToken = CONFIG.ADDON_TOKEN;

      try {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: 'server-side-token', writable: true, configurable: true });

        mockReq.query = {
          auth_token: 'iframe-jwt-token-should-not-be-used',
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-02T00:00:00Z'
        };

        vi.mocked(jwtLib.verifyClockifyJwt).mockResolvedValue({
          workspaceId: 'ws-123',
          userId: 'user-456',
          addonId: 'addon-123',
          backendUrl: 'https://api.clockify.me/api/v1'
        } as any);

        // No installation token available
        vi.mocked(installationService.getInstallation).mockResolvedValue(null);

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => [{ id: 'entry-1' }]
        } as Response);

        await proxyTimeEntries(mockReq as Request, mockRes as Response, vi.fn());

        // Verify server-side token was used, not the iframe token
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(URL),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Addon-Token': 'server-side-token' // Server-side token, NOT iframe token
            })
          })
        );

        // Verify iframe token is not in headers
        const fetchCall = (vi.mocked(global.fetch) as any).mock.calls[0];
        expect(fetchCall[1].headers['X-Addon-Token']).toBe('server-side-token');
        expect(fetchCall[1].headers['X-Addon-Token']).not.toBe('iframe-jwt-token-should-not-be-used');
        expect(fetchCall[1].headers).not.toHaveProperty('Authorization'); // No bearer token from iframe

        expect(statusSpy).not.toHaveBeenCalled();
        expect(jsonSpy).toHaveBeenCalledWith([{ id: 'entry-1' }]);
      } finally {
        Object.defineProperty(CONFIG, 'ADDON_TOKEN', { value: originalAddonToken, writable: true, configurable: true });
      }
    });
  });
});
