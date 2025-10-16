export type AddonClaims = {
  backendUrl: string;
  workspaceId: string;
  user?: string | { id: string };
  workspaceRole?: string;
  addonId?: string;
};

const padBase64 = (input: string) => input + '='.repeat((4 - (input.length % 4)) % 4);

export const getIframeToken = (): string | null => {
  return new URLSearchParams(window.location.search).get('auth_token');
};

export const decodeAddonToken = (token: string): AddonClaims => {
  try {
    const [, payload] = token.split('.');
    if (!payload) throw new Error('Invalid token structure');
    const decoded = atob(padBase64(payload).replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as AddonClaims;
  } catch (error) {
    throw new Error('Unable to decode auth token');
  }
};

export const getAddonContext = (token: string) => {
  const claims = decodeAddonToken(token);
  const backendUrl = (claims.backendUrl ?? '').replace(/\/$/, '');
  const workspaceId = claims.workspaceId ?? '';
  const userId = typeof claims.user === 'string' ? claims.user : claims.user?.id ?? '';
  const workspaceRole = claims.workspaceRole || (claims as any).workspace_role || (claims as any).role;
  return { claims, backendUrl, workspaceId, userId, workspaceRole };
};
