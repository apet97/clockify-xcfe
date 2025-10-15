/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock config to ensure non-dev so fetch runs
vi.mock('../apps/api/src/config/index.js', () => ({
  CONFIG: {
    NODE_ENV: 'production',
    CLOCKIFY_BASE_URL: 'https://api.clockify.me/api/',
    ADDON_KEY: 'test-key'
  }
}));

// Stub logger
vi.mock('../apps/api/src/lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

// Mock JWT verify to provide claims
vi.mock('../apps/api/src/lib/jwt.js', () => ({
  verifyClockifyJwt: vi.fn().mockResolvedValue({
    backendUrl: 'https://api.clockify.me/api/',
    workspaceId: 'ws-jsdom',
    userId: 'user-jsdom',
    addonId: 'addon-jsdom'
  })
}));

describe('Sidebar token refresh (JSDOM)', () => {
  let html: string;

  beforeEach(async () => {
    const { renderSidebar } = await import('../apps/api/src/controllers/uiController.js');

    const req = {
      query: { auth_token: 'initial-token' }
    } as unknown as Request;

    const send = vi.fn((body: string) => {
      html = body;
      return undefined as any;
    });

    const res = { status: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), send } as unknown as Response;

    await renderSidebar(req, res, vi.fn());
  });

  it('posts refreshAddonToken on button click', async () => {
    // Create DOM from HTML and execute scripts
    const dom = new (await import('jsdom')).JSDOM(html, {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });

    // Hook fetch to avoid network
    (dom.window as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

    // Stub postMessage
    const postSpy = vi.fn();
    (dom.window.top as any).postMessage = postSpy;

    // Click refresh token button
    const btn = dom.window.document.querySelector('button[aria-label="Refresh authentication token"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();

    expect(postSpy).toHaveBeenCalledWith({ title: 'refreshAddonToken' }, '*');
  });

  it('updates token and refetches on addonTokenRefreshed', async () => {
    const dom = new (await import('jsdom')).JSDOM(html, {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    (dom.window as any).fetch = fetchMock;

    // Allow DOMContentLoaded and initial fetch
    await new Promise(r => setTimeout(r, 0));

    // Simulate token refreshed message
    dom.window.dispatchEvent(
      new dom.window.MessageEvent('message', {
        data: { title: 'addonTokenRefreshed', body: { auth_token: 'new-token' } }
      })
    );

    // Wait a tick for handler
    await new Promise(r => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalled();
    const lastUrl = (fetchMock.mock.calls.at(-1) as any)[0] as string;
    expect(String(lastUrl)).toContain('auth_token=new-token');
  });

  it('shows error badge on refreshAddonTokenFailed', async () => {
    const dom = new (await import('jsdom')).JSDOM(html, {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });

    (dom.window as any).fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

    // Fire failure event
    dom.window.dispatchEvent(
      new dom.window.MessageEvent('message', {
        data: { title: 'refreshAddonTokenFailed' }
      })
    );

    await new Promise(r => setTimeout(r, 0));

    const toast = dom.window.document.getElementById('toast');
    expect(toast).toBeTruthy();
    expect(toast?.className).toContain('error');
    expect(toast?.style.display).toBe('block');
  });
});
