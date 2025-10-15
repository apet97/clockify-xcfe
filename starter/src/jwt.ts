import jwt from 'jsonwebtoken';
import { PUBLIC_RSA_PEM } from './config.js';
import type { ClockifyJwtClaims } from './types.js';

/**
 * Verify Clockify JWT signature and claims
 * @param token JWT from X-Addon-Lifecycle-Token, clockify-signature, or ?auth_token
 * @param expectedSub Expected addon key (sub claim)
 * @throws Error if verification fails
 */
export function verifyJwt(token: string, expectedSub: string): ClockifyJwtClaims {
  try {
    const decoded = jwt.verify(token, PUBLIC_RSA_PEM, {
      algorithms: ['RS256']
    }) as ClockifyJwtClaims;

    // Verify required claims
    if (decoded.iss !== 'clockify') {
      throw new Error(`Invalid issuer: ${decoded.iss}`);
    }

    if (!decoded.type || !['addon', 'lifecycle'].includes(decoded.type)) {
      throw new Error(`Invalid type: ${decoded.type}`);
    }

    if (decoded.sub !== expectedSub) {
      throw new Error(`Invalid subject: ${decoded.sub}, expected: ${expectedSub}`);
    }

    if (!decoded.workspaceId) {
      throw new Error('Missing workspaceId claim');
    }

    if (!decoded.addonId) {
      throw new Error('Missing addonId claim');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Decode JWT claims without verification (client-side use)
 * ONLY use this for reading claims AFTER server-side verification
 */
export function decodeClaims(token: string): Partial<ClockifyJwtClaims> {
  try {
    const decoded = jwt.decode(token) as ClockifyJwtClaims;
    return {
      backendUrl: decoded.backendUrl,
      reportsUrl: decoded.reportsUrl,
      locationsUrl: decoded.locationsUrl,
      screenshotsUrl: decoded.screenshotsUrl,
      workspaceId: decoded.workspaceId,
      user: decoded.user,
      addonId: decoded.addonId,
      language: decoded.language,
      theme: decoded.theme,
      workspaceRole: decoded.workspaceRole
    };
  } catch (error) {
    throw new Error('Failed to decode JWT');
  }
}
