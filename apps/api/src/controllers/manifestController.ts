import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const getManifest: RequestHandler = (_req, res) => {
  const manifest = {
    key: CONFIG.ADDON_KEY,
    name: CONFIG.ADDON_NAME,
    baseUrl: CONFIG.BASE_URL,
    description: "xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. Configure formulas to compute amounts, categorize entries, validate data integrity, and maintain consistent custom field values across your workspace.",
    minimalSubscriptionPlan: "PRO",
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
        type: "INSTALLED",
        path: "/lifecycle/installed"
      },
      {
        type: "STATUS_CHANGED",
        path: "/lifecycle/status"
      },
      {
        type: "SETTINGS_UPDATED", 
        path: "/lifecycle/settings"
      },
      {
        type: "DELETED",
        path: "/lifecycle/deleted"
      }
    ],
    webhooks: []
  };

  res.json(manifest);
};