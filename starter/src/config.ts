/**
 * Configuration for Clockify Add-on
 * Set via environment variables
 */

export const ADDON_KEY = process.env.ADDON_KEY || 'time-reports-example';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
export const PORT = parseInt(process.env.PORT || '8080', 10);

/**
 * Clockify Public RSA Key for JWT verification
 * Get from: https://clockify.me/developers#section/Authentication/JWT-verification
 */
export const PUBLIC_RSA_PEM = process.env.PUBLIC_RSA_PEM || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqwerj8234kasdf...
-----END PUBLIC KEY-----`;

/**
 * In-memory storage for installation context
 * In production, use a database
 */
export interface InstallationContext {
  workspaceId: string;
  userId: string;
  addonId: string;
  installToken: string; // X-Addon-Token from INSTALLED lifecycle
  installedAt: Date;
}

export const installations = new Map<string, InstallationContext>();

export function getInstallation(workspaceId: string): InstallationContext | undefined {
  return installations.get(workspaceId);
}

export function saveInstallation(ctx: InstallationContext): void {
  installations.set(ctx.workspaceId, ctx);
}
