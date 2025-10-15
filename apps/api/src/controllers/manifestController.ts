import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const getManifest: RequestHandler = (_req, res) => {
  const manifest = {
    schemaVersion: '1.3',
    key: CONFIG.ADDON_KEY,
    name: CONFIG.ADDON_NAME,
    baseUrl: CONFIG.BASE_URL,
    description:
      'xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries.',
    iconPath: '/assets/icon.svg',
    minimalSubscriptionPlan: CONFIG.MIN_PLAN,
    // Scopes per official enum (upper snake case)
    scopes: [
      'TIME_ENTRY_READ',
      'TIME_ENTRY_WRITE',
      'USER_READ',
      'PROJECT_READ',
      'TASK_READ',
      'CUSTOM_FIELDS_READ',
      'REPORTS_READ'
    ],
    components: [
      {
        type: 'sidebar',
        accessLevel: 'EVERYONE',
        path: '/ui/sidebar',
        label: 'Formula Manager'
      }
    ],
    // Serve settings UI from our backend to align with schema's selfHostedSettings
    settings: '/ui/settings',
    lifecycle: [
      { type: 'INSTALLED', path: '/api/lifecycle/installed' },
      { type: 'STATUS_CHANGED', path: '/api/lifecycle/status-changed' },
      { type: 'SETTINGS_UPDATED', path: '/api/lifecycle/settings-updated' },
      { type: 'DELETED', path: '/api/lifecycle/uninstalled' }
    ],
    webhooks: [
      { event: 'NEW_TIME_ENTRY', path: '/v1/webhooks/clockify' },
      { event: 'TIME_ENTRY_UPDATED', path: '/v1/webhooks/clockify' },
      { event: 'TIME_ENTRY_DELETED', path: '/v1/webhooks/clockify' },
      { event: 'NEW_TIMER_STARTED', path: '/v1/webhooks/clockify' },
      { event: 'BILLABLE_RATE_UPDATED', path: '/v1/webhooks/clockify' }
    ]
  };

  // Explicitly disable caching for manifest.json to avoid validator caches
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Access-Control-Allow-Origin', '*');
  res.type('application/json').json(manifest);
};
