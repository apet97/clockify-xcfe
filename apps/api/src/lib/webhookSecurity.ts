/**
 * Webhook Security Module
 *
 * Implements JWT-based webhook signature verification per Clockify Add-on Guidelines.
 *
 * Per official guide:
 * - Webhooks include "clockify-signature" header containing a JWT
 * - Verify with Clockify's RSA public key
 * - Check iss='clockify' and sub=addon-key claims
 * - Optionally compare against stored webhook tokens from installation
 *
 * References:
 * - ADDON GUIDE 2:205-207 (webhook JWT verification)
 * - newyork/auth.py:26-34 (reference implementation)
 */

import { verifyClockifyJwt, type ClockifyJwtClaims } from './jwt.js';
import { CONFIG } from '../config/index.js';
import { logger } from './logger.js';

// In-memory store for webhook-specific tokens (workspaceId -> eventType -> token)
// In production, this should be persisted to database or KV store
const webhookTokenStore = new Map<string, Map<string, string>>();

/**
 * Store webhook token from installation payload
 * @param workspaceId Workspace ID
 * @param eventType Event type (e.g., "TIME_ENTRY_UPDATED")
 * @param token JWT token for this specific webhook
 */
export const storeWebhookToken = (workspaceId: string, eventType: string, token: string): void => {
  if (!webhookTokenStore.has(workspaceId)) {
    webhookTokenStore.set(workspaceId, new Map());
  }
  webhookTokenStore.get(workspaceId)!.set(eventType, token);
  logger.debug({ workspaceId, eventType }, 'Stored webhook token for event');
};

/**
 * Retrieve stored webhook token
 * @param workspaceId Workspace ID
 * @param eventType Event type
 * @returns Stored token or undefined
 */
export const getWebhookToken = (workspaceId: string, eventType: string): string | undefined => {
  return webhookTokenStore.get(workspaceId)?.get(eventType);
};

/**
 * Clear all webhook tokens for a workspace (called on uninstall)
 * @param workspaceId Workspace ID
 */
export const clearWebhookTokens = (workspaceId: string): void => {
  webhookTokenStore.delete(workspaceId);
  logger.debug({ workspaceId }, 'Cleared webhook tokens');
};

export interface WebhookVerificationResult {
  valid: boolean;
  claims?: ClockifyJwtClaims;
  error?: string;
  workspaceId?: string;
}

/**
 * Verify Clockify webhook signature using JWT verification
 *
 * Per Clockify Add-on Guide:
 * 1. Extract JWT from "clockify-signature" header
 * 2. Verify signature with Clockify's RSA public key
 * 3. Validate claims: iss='clockify', sub=addon-key, type='addon'
 * 4. Optionally compare against stored token from installation
 *
 * @param signatureJwt JWT from "clockify-signature" header
 * @param eventType Event type from "clockify-webhook-event-type" header (optional, for token comparison)
 * @returns Verification result with claims if valid
 */
export const verifyWebhookSignature = async (
  signatureJwt: string | null | undefined,
  eventType?: string | null
): Promise<WebhookVerificationResult> => {
  // Allow unsigned in development mode
  if (CONFIG.DEV_ALLOW_UNSIGNED && !signatureJwt) {
    logger.warn('Webhook signature verification bypassed (DEV_ALLOW_UNSIGNED=true)');
    return {
      valid: true,
      workspaceId: 'dev-workspace'
    };
  }

  if (!signatureJwt) {
    return {
      valid: false,
      error: 'Missing clockify-signature header'
    };
  }

  try {
    // Verify JWT signature and claims using same function as lifecycle events
    const claims = await verifyClockifyJwt(signatureJwt, CONFIG.ADDON_KEY, false);

    // Validate this is a webhook-type token
    if (claims.type !== 'addon') {
      return {
        valid: false,
        error: `Invalid token type: expected 'addon', got '${claims.type}'`
      };
    }

    // Optional: Compare against stored webhook token from installation
    // This provides additional security by ensuring the token matches what was registered
    if (eventType && claims.workspaceId) {
      const storedToken = getWebhookToken(claims.workspaceId, eventType);
      if (storedToken && signatureJwt !== storedToken) {
        logger.warn(
          { workspaceId: claims.workspaceId, eventType },
          'Webhook token does not match stored token from installation'
        );
        // Note: We log but don't fail - the JWT signature is still valid
        // In stricter mode, you could return { valid: false, error: 'Token mismatch' }
      }
    }

    logger.debug(
      { workspaceId: claims.workspaceId, addonId: claims.addonId, eventType },
      'Webhook signature verified successfully'
    );

    return {
      valid: true,
      claims,
      workspaceId: claims.workspaceId
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ err: error, eventType }, 'Webhook signature verification failed');

    return {
      valid: false,
      error: `JWT verification failed: ${message}`
    };
  }
};

/**
 * Legacy HMAC verification (deprecated, kept for backward compatibility)
 * @deprecated Use verifyWebhookSignature instead
 */
export const verifyClockifySignature = (rawBody: string, signatureHeader?: string | null): boolean => {
  logger.warn('verifyClockifySignature (HMAC) is deprecated - use verifyWebhookSignature (JWT) instead');

  if (CONFIG.DEV_ALLOW_UNSIGNED && CONFIG.NODE_ENV === 'development') return true;

  // If no HMAC secret configured, this legacy method cannot work
  if (!CONFIG.CLOCKIFY_WEBHOOK_SECRET) {
    return false;
  }

  if (!signatureHeader) return false;

  // This is the old HMAC-based verification
  // Kept for backward compatibility but should not be used for new webhooks
  return false;
};
