import { ADDON_KEY, BASE_URL } from './config.js';
import type { ManifestV1_3 } from './types.js';

/**
 * Structured Settings Schema
 * Reference: https://clockify.me/developers#section/Add-on-settings
 */
const STRUCTURED_SETTINGS = {
  tabs: [
    {
      id: 'general',
      name: 'General Settings',
      description: 'Configure general add-on behavior',
      groups: [
        {
          id: 'display',
          name: 'Display Options',
          fields: [
            {
              id: 'reportDays',
              type: 'DROPDOWN',
              label: 'Report Period',
              description: 'Number of days to include in time reports',
              required: true,
              defaultValue: '7',
              options: [
                { value: '1', label: 'Last 24 hours' },
                { value: '7', label: 'Last 7 days' },
                { value: '14', label: 'Last 14 days' },
                { value: '30', label: 'Last 30 days' }
              ]
            },
            {
              id: 'showDescription',
              type: 'CHECKBOX',
              label: 'Show Descriptions',
              description: 'Display time entry descriptions in sidebar',
              required: false,
              defaultValue: 'true'
            },
            {
              id: 'customMessage',
              type: 'TXT',
              label: 'Custom Message',
              description: 'Optional message to display in sidebar header',
              required: false,
              defaultValue: ''
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Generate Manifest v1.3
 */
export function getManifest(): ManifestV1_3 {
  return {
    key: ADDON_KEY,
    name: 'Time Reports',
    baseUrl: BASE_URL,
    minimalSubscriptionPlan: 'FREE',
    scopes: [
      'TIME_ENTRY_READ',
      'WORKSPACE_READ',
      'USER_READ'
    ],
    components: [
      {
        type: 'SIDEBAR',
        path: '/ui/sidebar',
        label: 'Time Reports',
        accessLevel: 'EVERYONE'
      }
    ],
    settings: JSON.stringify(STRUCTURED_SETTINGS),
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
        path: '/webhooks/time-entry'
      },
      {
        event: 'NEW_TIME_ENTRY',
        path: '/webhooks/time-entry'
      }
    ]
  };
}
