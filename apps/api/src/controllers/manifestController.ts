import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const getManifest: RequestHandler = (_req, res) => {
  const manifest = {
    key: CONFIG.ADDON_KEY,
    name: CONFIG.ADDON_NAME,
    baseUrl: CONFIG.BASE_URL,
    description: "xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. Configure formulas to compute amounts, categorize entries, validate data integrity, and maintain consistent custom field values across your workspace.",
    minimalSubscriptionPlan: CONFIG.MIN_PLAN,
    scopes: [
      "TIME_ENTRY_READ",
      "TIME_ENTRY_WRITE", 
      "USER_READ",
      "PROJECT_READ",
      "TASK_READ",
      "CUSTOM_FIELDS_READ",
      "WORKSPACE_READ"
    ],
    components: [
      {
        type: "sidebar",
        accessLevel: "EVERYONE",
        path: "/ui/sidebar",
        label: "xCFE"
      }
    ],
    settings: JSON.stringify({
      tabs: [
        {
          id: "general",
          name: "General Settings",
          description: "Configure general xCFE behavior",
          fields: [
            {
              key: "enableAutoFormulas",
              type: "TXT",
              label: "Enable Auto Formulas",
              description: "Automatically evaluate formulas on time entry changes",
              required: false,
              defaultValue: "true"
            }
          ]
        }
      ]
    }),
    lifecycle: [
      {
        type: "installed",
        url: `${CONFIG.BASE_URL}/lifecycle/installed`
      },
      {
        type: "statusChanged",
        url: `${CONFIG.BASE_URL}/lifecycle/status`
      },
      {
        type: "settingsUpdated", 
        url: `${CONFIG.BASE_URL}/lifecycle/settings`
      },
      {
        type: "deleted",
        url: `${CONFIG.BASE_URL}/lifecycle/deleted`
      }
    ],
    webhooks: []
  };

  res.json(manifest);
};