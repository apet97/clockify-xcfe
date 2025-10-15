import type { Request, Response } from 'express';
import { z } from 'zod';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';
import { CONFIG } from '../config/index.js';

/**
 * GET /v1/me
 * Returns current user info based on iframe JWT
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // Validate iframe JWT FIRST
    if (!req.query.auth_token) {
      return res.status(401).json({ error: 'invalid_iframe_token', message: 'Missing auth_token query parameter' });
    }

    const authToken = z.string().parse(req.query.auth_token);

    // Verify JWT
    const claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);

    // Extract claims
    const { workspaceId, userId } = claims;

    // For now, all authenticated users are admins (can be refined with role check via Clockify API)
    const isAdmin = true;

    logger.debug({ workspaceId, userId }, '/v1/me request');

    res.json({
      isAdmin,
      workspaceId,
      userId
    });

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: req.correlationId
    }, '/v1/me failed');

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    if (error instanceof Error && (error.message.includes('JWT verification failed') || error.message.includes('Invalid JWT subject'))) {
      return res.status(401).json({
        error: 'Invalid authentication token'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
