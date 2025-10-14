import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const getManifest: RequestHandler = (_req, res) => {
  const manifest = {
    schemaVersion: "1.3",
    key: "xcfe-custom-field-expander",
    name: "xCustom Field Expander",
    baseUrl: CONFIG.BASE_URL,
    description: "Automated formula evaluation and validation for Clockify custom fields",
    iconPath: "/assets/icon.png",
    requiredPlan: "FREE",
    scopes: [
      "TIME_ENTRY_READ",
      "TIME_ENTRY_WRITE",
      "USER_READ",
      "PROJECT_READ",
      "TASK_READ",
      "CUSTOM_FIELD_READ"
    ],
    components: [
      {
        location: "SIDEBAR",
        access: "EVERYONE",
        path: "/ui/sidebar",
        label: "Formula Manager"
      },
      {
        location: "PROJECT_OVERVIEW",
        access: "EVERYONE",
        path: "/ui/project-tab",
        label: "Formulas"
      }
    ],
    settings: {
      type: "STRUCTURED",
      path: "/api/lifecycle/settings-updated",
      properties: [
        {
          id: "enableAutoEvaluation",
          name: "Enable Auto Evaluation",
          type: "CHECKBOX",
          value: true,
          accessLevel: "ADMINS"
        },
        {
          id: "evaluationDelay",
          name: "Evaluation Delay (seconds)",
          type: "NUMBER",
          value: 5,
          accessLevel: "ADMINS"
        },
        {
          id: "maxFormulasPerWorkspace",
          name: "Max Formulas Per Workspace",
          type: "NUMBER",
          value: 50,
          accessLevel: "ADMINS"
        }
      ]
    },
    lifecycle: {
      installed: "/api/lifecycle/installed",
      updated: "/api/lifecycle/updated",
      uninstalled: "/api/lifecycle/uninstalled",
      statusChanged: "/api/lifecycle/status-changed"
    },
    webhooks: [
      {
        webhookType: "TIME_ENTRY_CREATED",
        path: "/api/webhooks/time-entry-created"
      },
      {
        webhookType: "TIME_ENTRY_UPDATED",
        path: "/api/webhooks/time-entry-updated"
      },
      {
        webhookType: "TIME_ENTRY_DELETED",
        path: "/api/webhooks/time-entry-deleted"
      }
    ]
  };

  res.json(manifest);
};