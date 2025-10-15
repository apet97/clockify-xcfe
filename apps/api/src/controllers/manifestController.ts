import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const getManifest: RequestHandler = (_req, res) => {
  // Legacy/tabs format expected by current schema (stringified JSON)
  const structuredSettings = {
    tabs: [
      {
        id: 'automation',
        name: 'Automation',
        description: 'Control how formulas run when Clockify events are received.',
        groups: [
          {
            id: 'runtime',
            name: 'Runtime',
            fields: [
              {
                id: 'enableAutoEvaluation',
                type: 'CHECKBOX',
                label: 'Enable automatic evaluation',
                description: 'Run formulas automatically for incoming Clockify events.',
                required: false,
                defaultValue: 'true'
              },
              {
                id: 'evaluationDelaySeconds',
                type: 'TXT',
                label: 'Evaluation delay (seconds)',
                description: 'Optional delay before formulas execute to allow Clockify processing.',
                required: false,
                defaultValue: '5'
              }
            ]
          }
        ]
      }
    ]
  };

  const manifest = {
    schemaVersion: '1.3',
    key: CONFIG.ADDON_KEY,
    name: CONFIG.ADDON_NAME,
    baseUrl: CONFIG.BASE_URL,
    description:
      'xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries.',
    iconPath: '/assets/icon.svg',
    minimalSubscriptionPlan: CONFIG.MIN_PLAN,
    // Scopes aligned to schema enumeration (upper snake case)
    scopes: [
      'TIME_ENTRY_READ',
      'TIME_ENTRY_WRITE',
      'USER_READ',
      'PROJECT_READ',
      'TASK_READ',
      'CUSTOM_FIELDS_READ'
    ],
    components: [
      {
        type: 'sidebar',
        accessLevel: 'EVERYONE',
        path: '/ui/sidebar',
        label: 'Formula Manager'
      }
    ],
    settings: JSON.stringify(structuredSettings),
    lifecycle: [
      { type: 'INSTALLED', path: '/api/lifecycle/installed' },
      { type: 'STATUS_CHANGED', path: '/api/lifecycle/status-changed' },
      { type: 'SETTINGS_UPDATED', path: '/api/lifecycle/settings-updated' },
      { type: 'DELETED', path: '/api/lifecycle/uninstalled' }
    ],
    webhooks: [
      { event: 'NEW_TIME_ENTRY', path: '/v1/webhooks/clockify' },
      { event: 'TIME_ENTRY_UPDATED', path: '/v1/webhooks/clockify' },
      { event: 'TIME_ENTRY_DELETED', path: '/v1/webhooks/clockify' }
    ]
  };

  // Explicitly disable caching for manifest.json to avoid validator caches
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Access-Control-Allow-Origin', '*');
  res.type('application/json').json(manifest);
};
