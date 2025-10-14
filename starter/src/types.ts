import { z } from 'zod';

/**
 * Manifest v1.3 Types
 */
export interface ManifestV1_3 {
  key: string;
  name: string;
  baseUrl: string;
  minimalSubscriptionPlan?: 'FREE' | 'BASIC' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  scopes: string[];
  components: Component[];
  settings?: string; // JSON-encoded structured settings
  lifecycle?: LifecycleHook[];
  webhooks?: WebhookSubscription[];
}

export interface Component {
  type: 'SIDEBAR' | 'TIME_ENTRY' | 'PROJECT' | 'SETTINGS';
  path: string;
  label: string;
  accessLevel?: 'EVERYONE' | 'WORKSPACE_ADMINS';
}

export interface LifecycleHook {
  type: 'INSTALLED' | 'STATUS_CHANGED' | 'SETTINGS_UPDATED' | 'DELETED';
  path: string;
}

export interface WebhookSubscription {
  event: string;
  path: string;
}

/**
 * JWT Claims from Clockify
 */
export interface ClockifyJwtClaims {
  iss: string; // "clockify"
  type: string; // "addon" | "lifecycle"
  sub: string; // addon key
  backendUrl: string;
  reportsUrl?: string;
  locationsUrl?: string;
  screenshotsUrl?: string;
  workspaceId: string;
  user?: string;
  addonId: string;
  language?: string;
  theme?: string;
  workspaceRole?: string;
  exp: number;
  iat: number;
}

/**
 * Lifecycle Payloads
 */
export const LifecycleInstalledSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  addonId: z.string()
});

export const LifecycleStatusChangedSchema = z.object({
  workspaceId: z.string(),
  addonId: z.string(),
  status: z.enum(['ENABLED', 'DISABLED'])
});

export const LifecycleSettingsUpdatedSchema = z.object({
  workspaceId: z.string(),
  addonId: z.string(),
  settings: z.array(z.object({
    id: z.string(),
    value: z.any()
  }))
});

export const LifecycleDeletedSchema = z.object({
  workspaceId: z.string(),
  addonId: z.string()
});

/**
 * Webhook Payloads
 */
export const WebhookTimeEntrySchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  timeEntryId: z.string(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  start: z.string(),
  end: z.string().optional()
});

/**
 * Settings Proxy
 */
export const SettingsPatchSchema = z.array(z.object({
  id: z.string(),
  value: z.any()
}));

export type LifecycleInstalled = z.infer<typeof LifecycleInstalledSchema>;
export type LifecycleStatusChanged = z.infer<typeof LifecycleStatusChangedSchema>;
export type LifecycleSettingsUpdated = z.infer<typeof LifecycleSettingsUpdatedSchema>;
export type LifecycleDeleted = z.infer<typeof LifecycleDeletedSchema>;
export type WebhookTimeEntry = z.infer<typeof WebhookTimeEntrySchema>;
export type SettingsPatch = z.infer<typeof SettingsPatchSchema>;
