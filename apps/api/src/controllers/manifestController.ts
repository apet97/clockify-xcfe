import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

/**
 * Manifest Controller - Clockify Add-on Schema 1.3
 *
 * Serves the add-on manifest per Clockify Marketplace standards.
 * Updated to match the official schema structure from infra/manifest.json
 *
 * Key changes from previous version:
 * - Changed subscriptionPlan (was minimalSubscriptionPlan)
 * - Components array with proper type: "sidebar.page" (was "sidebar")
 * - Settings with STRUCTURED type and properties schema
 * - Lifecycle as object with method+path (was array)
 * - Webhooks with proper event names and webhookType
 */
export const getManifest: RequestHandler = (_req, res) => {
  const manifest = {
    schemaVersion: '1.3',
    key: CONFIG.ADDON_KEY,
    name: CONFIG.ADDON_NAME,
    baseUrl: CONFIG.BASE_URL,
    description:
      'Automated formula evaluation and validation for Clockify custom fields. Computes amounts, categorizes entries, validates data integrity, and maintains consistent custom field values across your workspace using mathematical formulas, conditional logic, and overtime rules.',
    subscriptionPlan: CONFIG.MIN_PLAN,
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
        type: 'sidebar.page',
        label: 'Field Expander',
        path: '/ui/sidebar',
        accessLevel: 'ADMINS'
      }
    ],
    settings: {
      type: 'STRUCTURED',
      path: '/lifecycle/settings-updated',
      properties: [
        {
          key: 'strict_mode',
          label: 'Strict Validation Mode',
          type: 'CHECKBOX',
          value: false,
          required: false,
          accessLevel: 'ADMINS',
          hint: 'Enable strict validation for all formula evaluations. When enabled, formulas with errors will prevent time entry updates.'
        },
        {
          key: 'reference_months',
          label: 'OT Reference Period (months)',
          type: 'NUMBER',
          value: 6,
          required: false,
          accessLevel: 'ADMINS',
          hint: 'Number of historical months to consider for overtime calculations. Valid range: 1-12 months. Default: 6.'
        },
        {
          key: 'region',
          label: 'Clockify Region Override',
          type: 'SELECT',
          required: false,
          accessLevel: 'ADMINS',
          options: [
            { value: 'auto', label: 'Auto-detect from JWT' },
            { value: 'global', label: 'Global (api.clockify.me)' },
            { value: 'euc1', label: 'Europe - Germany (euc1)' },
            { value: 'use2', label: 'USA (use2)' },
            { value: 'euw2', label: 'UK (euw2)' },
            { value: 'apse2', label: 'Australia (apse2)' }
          ],
          hint: 'Override automatic region detection. Recommended: Leave on Auto-detect to use workspace configured region.'
        }
      ]
    },
    lifecycle: {
      installed: {
        method: 'POST',
        path: '/lifecycle/installed'
      },
      statusChanged: {
        method: 'POST',
        path: '/lifecycle/status-changed'
      },
      settingsUpdated: {
        method: 'POST',
        path: '/lifecycle/settings-updated'
      },
      deleted: {
        method: 'POST',
        path: '/lifecycle/deleted'
      }
    },
    webhooks: [
      {
        event: 'TIME_ENTRY_UPDATED',
        path: '/v1/webhooks/clockify',
        webhookType: 'ADDON'
      },
      {
        event: 'TIME_ENTRY_CREATED',
        path: '/v1/webhooks/clockify',
        webhookType: 'ADDON'
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
