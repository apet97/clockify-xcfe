import * as jwt from 'jsonwebtoken';
import { logger } from './logger.js';

// Clockify public key for JWT verification (RS256)
const CLOCKIFY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMSfQu3yq2Yaq47INOzgFy9IUG8/JfwiehsmbrKa
49t/xSkpGlu9wlGUyYg4eKDUwoHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUhZ
rLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduk
yQIDAQAB
-----END PUBLIC KEY-----`;

export interface ClockifyJwtPayload {
  iss: string;
  sub: string;
  type: string;
  workspaceId: string;
  user: string;
  addonId: string;
  backendUrl: string;
  reportsUrl: string;
  locationsUrl: string;
  screenshotsUrl: string;
  language?: string;
  theme?: string;
  workspaceRole?: string;
  exp?: number;
  iat?: number;
}

export interface InstallationTokenPayload extends ClockifyJwtPayload {
  // Installation tokens have admin privileges and don't expire
}

export interface UserTokenPayload extends ClockifyJwtPayload {
  // User tokens have user-specific claims and expire in 30 minutes
  language: string;
  theme: string;
  workspaceRole: string;
  exp: number;
}

export interface WebhookTokenPayload {
  iss: string;
  sub: string;
  type: string;
  workspaceId: string;
  addonId: string;
}

export class ClockifyJwtError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ClockifyJwtError';
  }
}

/**
 * Verifies a Clockify JWT token with proper validation
 */
export function verifyClockifyJwt(
  token: string,
  expectedAddonKey: string,
  tokenType: 'installation' | 'user' | 'webhook' = 'user'
): ClockifyJwtPayload {
  try {
    const payload = jwt.verify(token, CLOCKIFY_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'clockify',
      subject: expectedAddonKey
    }) as ClockifyJwtPayload;

    // Additional validation based on token type
    if (tokenType === 'webhook') {
      if (payload.type !== 'addon') {
        throw new ClockifyJwtError('Invalid token type for webhook', 'INVALID_TYPE');
      }
    } else {
      if (payload.type !== 'addon') {
        throw new ClockifyJwtError('Invalid token type', 'INVALID_TYPE');
      }
    }

    // Check expiration for user tokens
    if (tokenType === 'user' && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new ClockifyJwtError('Token has expired', 'TOKEN_EXPIRED');
      }
    }

    logger.debug('JWT verification successful', {
      tokenType,
      workspaceId: payload.workspaceId,
      userId: payload.user,
      addonId: payload.addonId
    });

    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ClockifyJwtError(`JWT verification failed: ${error.message}`, 'JWT_ERROR');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new ClockifyJwtError('Token has expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof ClockifyJwtError) {
      throw error;
    }
    throw new ClockifyJwtError(`Unexpected error during JWT verification: ${String(error)}`, 'UNKNOWN_ERROR');
  }
}

/**
 * Decodes JWT payload without verification (for debugging only)
 */
export function decodeJwtPayload(token: string): ClockifyJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    logger.warn('Failed to decode JWT payload', { error });
    return null;
  }
}

/**
 * Extracts API base URLs from JWT claims
 */
export function getApiUrls(payload: ClockifyJwtPayload) {
  return {
    backendUrl: payload.backendUrl || 'https://api.clockify.me/api',
    reportsUrl: payload.reportsUrl || 'https://reports.api.clockify.me',
    locationsUrl: payload.locationsUrl || 'https://locations.api.clockify.me',
    screenshotsUrl: payload.screenshotsUrl || 'https://screenshots.api.clockify.me'
  };
}
