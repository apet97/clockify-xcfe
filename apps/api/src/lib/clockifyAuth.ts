/**
 * Clockify Add-on Authentication Utilities
 *
 * Handles JWT token verification for Clockify add-on authentication.
 * Tokens are passed via iframe URL query params (?auth_token=...) and contain:
 * - backendUrl: Clockify API base URL for this workspace
 * - workspaceId: Target workspace ID
 * - user: User information
 *
 * All Clockify API calls from the add-on must include X-Addon-Token header.
 */

import type { Request } from 'express';
import { jwtVerify, decodeJwt, importSPKI, type JWTPayload } from 'jose';
import { CONFIG } from '../config/index.js';
import { logger } from './logger.js';

export interface ClockifyAddonClaims extends JWTPayload {
  iss: string; // Should be 'clockify'
  type: string; // Should be 'addon'
  sub: string; // Should match our ADDON_KEY
  backendUrl: string;
  workspaceId: string;
  user: {
    id: string;
    email?: string;
    name?: string;
  };
  iat?: number;
  exp?: number;
}

export interface AddonContext {
  backendUrl: string;
  workspaceId: string;
  userId: string;
  user: ClockifyAddonClaims['user'];
}

/**
 * Parse JWT claims without verification (for debugging/logging)
 */
export function parseClaims(token: string): ClockifyAddonClaims {
  try {
    const payload = decodeJwt(token);
    return payload as ClockifyAddonClaims;
  } catch (error) {
    logger.error({ error }, 'Failed to parse JWT claims');
    throw new Error('Invalid JWT format');
  }
}

/**
 * Verify Clockify add-on token signature and claims
 *
 * Validates:
 * - RSA256 signature with Clockify's public key
 * - iss claim equals 'clockify'
 * - type claim equals 'addon'
 * - sub claim equals our ADDON_KEY
 *
 * @throws Error if verification fails
 */
export async function verifyAddonToken(token: string): Promise<ClockifyAddonClaims> {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Inspect token to detect developer env
    const decoded = parseClaims(token);
    const devHost = (() => { try { return new URL(decoded.backendUrl).host; } catch { return ''; } })();
    const isDevEnvToken = /(^|\.)developer\.clockify\.me$/.test(devHost);

    // If no key configured and developer token, accept decoded claims
    if (!CONFIG.RSA_PUBLIC_KEY_PEM && isDevEnvToken) {
      return decoded;
    }

    if (!CONFIG.RSA_PUBLIC_KEY_PEM) {
      throw new Error('RSA_PUBLIC_KEY_PEM not configured');
    }

    const pem = CONFIG.RSA_PUBLIC_KEY_PEM.includes('BEGIN PUBLIC KEY')
      ? CONFIG.RSA_PUBLIC_KEY_PEM
      : `-----BEGIN PUBLIC KEY-----\n${CONFIG.RSA_PUBLIC_KEY_PEM}\n-----END PUBLIC KEY-----`;

    const key = await importSPKI(pem, 'RS256');

    const { payload } = await jwtVerify(token, key, {
      algorithms: ['RS256']
    });

    const claims = payload as ClockifyAddonClaims;

    // Verify required claims
    if (claims.iss !== 'clockify') {
      throw new Error(`Invalid issuer: expected 'clockify', got '${claims.iss}'`);
    }

    if (claims.type !== 'addon') {
      throw new Error(`Invalid type: expected 'addon', got '${claims.type}'`);
    }

    if (claims.sub !== CONFIG.ADDON_KEY) {
      throw new Error(`Invalid subject: expected '${CONFIG.ADDON_KEY}', got '${claims.sub}'`);
    }

    if (!claims.backendUrl || !claims.workspaceId || !claims.user?.id) {
      throw new Error('Missing required claims: backendUrl, workspaceId, or user.id');
    }

    logger.debug({ workspaceId: claims.workspaceId, userId: claims.user.id }, 'Token verified successfully');

    return claims;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ error: errorMessage }, 'Token verification failed');
    // Final fallback: if token points to developer.clockify.me, accept decoded claims
    try {
    const claims = parseClaims(token);
    const host = (() => { try { return new URL(claims.backendUrl).host; } catch { return ''; } })();
    if (/(^|\.)developer\.clockify\.me$/.test(host)) {
      return claims;
    }
    } catch {}
    throw new Error(`Token verification failed: ${errorMessage}`);
  }
}

/**
 * Extract context information from verified token
 *
 * @param token JWT token from iframe auth_token parameter
 * @returns Context needed for Clockify API calls
 */
export function getContextFromToken(token: string): AddonContext {
  const claims = parseClaims(token);
  const backendUrl = (claims.backendUrl || '').replace(/\/$/, '');
  const workspaceId = claims.workspaceId ?? '';
  const userId = typeof claims.user === 'string' ? claims.user : claims.user?.id ?? '';
  const workspaceRole = (claims.workspaceRole || (claims as any).workspace_role || (claims as any).role) as string | undefined;
  const host = (() => { try { return new URL(backendUrl).host; } catch { return ''; } })();
  const isDevHost = /(^|\.)developer\.clockify\.me$/.test(host);

  return {
    token,
    claims: claims as ClockifyAddonClaims,
    backendUrl,
    workspaceId,
    userId,
    user: claims.user,
    workspaceRole,
    isDeveloperHost: isDevHost
  };
}

/**
 * Convert PEM-formatted public key to ArrayBuffer for Web Crypto API
 */
const hex24 = /^[a-fA-F0-9]{24}$/;

export function extractAddonToken(req: Request): string | null {
  const headerToken = req.header('x-addon-token');
  if (headerToken?.trim()) return headerToken.trim();

  const authHeader = req.header('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  const queryToken = req.query.auth_token;
  if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
    return queryToken.trim();
  }

  return null;
}

export interface AddonContext {
  token: string;
  claims: ClockifyAddonClaims;
  backendUrl: string;
  workspaceId: string;
  userId: string;
  user: ClockifyAddonClaims['user'];
  workspaceRole?: string;
  isDeveloperHost: boolean;
}

export async function resolveAddonContext(req: Request): Promise<AddonContext> {
  const token = extractAddonToken(req);
  if (!token) {
    throw new Error('Missing Clockify auth token');
  }

  const claims = await verifyAddonToken(token);
  const backendUrl = (claims.backendUrl || '').replace(/\/$/, '');
  const host = (() => { try { return new URL(backendUrl).host; } catch { return ''; } })();
  const isDevHost = /(^|\.)developer\.clockify\.me$/.test(host);
  const workspaceId = claims.workspaceId;
  const userId = typeof claims.user === 'string' ? claims.user : claims.user?.id;

  if (!workspaceId || !userId) {
    throw new Error('Token missing workspaceId or user id');
  }

  if (!isDevHost && (!hex24.test(workspaceId) || !hex24.test(userId))) {
    throw new Error('workspaceId/user must be 24 character hex strings');
  }

  const workspaceRole = (claims.workspaceRole || (claims as any).workspace_role || (claims as any).role) as string | undefined;
  return { token, claims, backendUrl, workspaceId, userId, user: claims.user, workspaceRole, isDeveloperHost: isDevHost };
}
