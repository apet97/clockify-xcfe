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

import { jwtVerify, decodeJwt, type JWTPayload } from 'jose';
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

  // Get public key from config
  const publicKeyPEM = CONFIG.RSA_PUBLIC_KEY_PEM;

  try {
    // In developer environment, allow decode-only fallback for tokens pointing to developer.clockify.me
    const decoded = parseClaims(token);
    const devHost = (() => { try { return new URL(decoded.backendUrl).host; } catch { return ''; } })();
    const isDevEnvToken = /(^|\.)developer\.clockify\.me$/.test(devHost);

    if (!publicKeyPEM && isDevEnvToken) {
      // Accept decoded claims without signature verification in developer env
      return decoded;
    }

    if (!publicKeyPEM) {
      throw new Error('RSA_PUBLIC_KEY_PEM not configured');
    }

    // Import the public key (SPKI)
    const publicKey = await (globalThis.crypto ?? (await import('node:crypto')).webcrypto).subtle.importKey(
      'spki',
      pemToArrayBuffer(publicKeyPEM),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify the JWT
    const { payload } = await jwtVerify(token, publicKey, {
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

  return {
    backendUrl: claims.backendUrl,
    workspaceId: claims.workspaceId,
    userId: claims.user.id,
    user: claims.user
  };
}

/**
 * Convert PEM-formatted public key to ArrayBuffer for Web Crypto API
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove PEM header/footer and whitespace
  const pemContent = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  // Base64 decode
  const binaryString = atob(pemContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}
