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
    settings: {
      tabs: [
        {
          id: 'general',
          name: 'General Settings',
          settings: [
            {
              id: 'strict_mode',
              name: 'Strict Validation Mode',
              type: 'CHECKBOX',
              value: false,
              required: false,
              accessLevel: 'ADMINS',
              description:
                'Enable strict validation for all formula evaluations. When enabled, formulas with errors will prevent time entry updates.'
            },
            {
              id: 'reference_months',
              name: 'OT Reference Period (months)',
              type: 'NUMBER',
              value: 6,
              required: false,
              accessLevel: 'ADMINS',
              description:
                'Number of historical months to consider for overtime calculations. Valid range: 1-12 months. Default: 6.'
            },
            {
              id: 'region',
              name: 'Clockify Region Override',
              type: 'DROPDOWN_SINGLE',
              value: 'auto',
              required: false,
              accessLevel: 'ADMINS',
              description:
                'Override automatic region detection. Recommended: Leave on Auto-detect to use workspace configured region.',
              allowedValues: [
                { key: 'auto', value: 'Auto-detect from JWT' },
                { key: 'global', value: 'Global (api.clockify.me)' },
                { key: 'euc1', value: 'Europe - Germany (euc1)' },
                { key: 'use2', value: 'USA (use2)' },
                { key: 'euw2', value: 'UK (euw2)' },
                { key: 'apse2', value: 'Australia (apse2)' }
              ]
            }
          ]
        }
      ]
    },
    lifecycle: [
      {
        type: 'INSTALLED',
        path: '/lifecycle/installed'
      },
      {
        type: 'STATUS_CHANGED',
        path: '/lifecycle/status-changed'
      },
      {
        type: 'SETTINGS_UPDATED',
        path: '/lifecycle/settings-updated'
      },
      {
        type: 'DELETED',
        path: '/lifecycle/deleted'
      }
    ],
    webhooks: [
      {
        event: 'TIME_ENTRY_UPDATED',
        path: '/v1/webhooks/clockify'
      },
      {
        event: 'NEW_TIME_ENTRY',
        path: '/v1/webhooks/clockify'
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
