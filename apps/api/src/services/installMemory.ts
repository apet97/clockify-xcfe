import { logger } from '../lib/logger.js';

type InstallCacheEntry = {
  token: string;
  backendUrl?: string;
  updatedAt: number;
};

const cache = new Map<string, InstallCacheEntry>();

export const rememberInstallation = (workspaceId: string, token: string, backendUrl?: string) => {
  cache.set(workspaceId, { token, backendUrl, updatedAt: Date.now() });
  logger.info({ workspaceId, hasBackendUrl: !!backendUrl }, 'Installation token cached (memory)');
};

export const forgetInstallation = (workspaceId: string) => {
  cache.delete(workspaceId);
  logger.info({ workspaceId }, 'Installation token removed from memory');
};

export const getInstallationTokenFromMemory = (workspaceId: string): string | undefined => {
  return cache.get(workspaceId)?.token;
};

export const getBackendUrlFromMemory = (workspaceId: string): string | undefined => {
  return cache.get(workspaceId)?.backendUrl;
};

