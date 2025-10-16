import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

/**
 * Manifest Controller - Clockify Add-on Schema 1.3
 *
 * Serves the add-on manifest per official Clockify JSON Schema 1.3.
 * Structure validated against:
 * newyork/addon-java-sdk-main/annotation-processor/src/main/resources/clockify-manifests/1.3.json
 *
 * Key requirements:
 * - minimalSubscriptionPlan (REQUIRED, not subscriptionPlan)
 * - lifecycle: array with type+path (not object)
 * - webhooks: array with event+path (no webhookType field)
 * - components.type: "sidebar" (not "sidebar.page")
 * - settings: object with "tabs" array OR string (self-hosted path)
 */
export const getManifest: RequestHandler = (_req, res) => {
  // Structured settings must be provided as a JSON STRING that the
  // Clockify Marketplace parses. The expected shape is:
  // { tabs: [{ id, name, description?, groups: [{ id, name, fields: [{ id, type, label, description?, required?, defaultValue? }, ...] }] }] }
  const structuredSettings = {
    tabs: [
      {
        id: 'general',
        name: 'General Settings',
        description: 'Configure validation and runtime behavior for formula evaluation.',
        groups: [
          {
            id: 'runtime',
            name: 'Runtime',
            fields: [
              {
                id: 'strict_mode',
                type: 'CHECKBOX',
                label: 'Strict validation mode',
                description: 'Prevent updates when formulas produce errors.',
                required: false,
                defaultValue: 'false'
              },
              {
                id: 'evaluation_delay_seconds',
                type: 'TXT',
                label: 'Evaluation delay (seconds)',
                description: 'Optional delay before formulas execute to allow Clockify to settle.',
                required: false,
                defaultValue: '5'
              },
              {
                id: 'region',
                type: 'TXT',
                label: 'Clockify region override',
                description: 'Optional region code (euc1/use2/euw2/apse2). Leave empty to auto-detect.',
                required: false,
                defaultValue: ''
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
      'Automated formula evaluation and validation for Clockify custom fields. Computes amounts, categorizes entries, validates data integrity, and maintains consistent custom field values across your workspace using mathematical formulas, conditional logic, and overtime rules.',
    minimalSubscriptionPlan: CONFIG.MIN_PLAN,
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
        label: 'Field Expander',
        path: '/ui/sidebar',
        accessLevel: 'ADMINS'
      }
    ],
    // Important: provide settings as a JSON string
    settings: JSON.stringify(structuredSettings),
    lifecycle: [
      {
        type: 'INSTALLED',
        path: '/api/lifecycle/installed'
      },
      {
        type: 'STATUS_CHANGED',
        path: '/api/lifecycle/status-changed'
      },
      {
        type: 'SETTINGS_UPDATED',
        path: '/api/lifecycle/settings-updated'
      },
      {
        type: 'DELETED',
        path: '/api/lifecycle/uninstalled'
      }
    ],
    webhooks: [
      {
        event: 'TIME_ENTRY_UPDATED',
        path: '/api/webhooks/time-entry-updated'
      },
      {
        event: 'NEW_TIME_ENTRY',
        path: '/api/webhooks/time-entry-created'
      }
    ]
  };

  // Explicitly disable caching for manifest.json to avoid validator caches
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Access-Control-Allow-Origin', '*');
  res.type('application/json').json(manifest);
};
