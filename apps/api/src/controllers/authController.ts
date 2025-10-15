import type { RequestHandler } from 'express';
import { z } from 'zod';
import { issueMagicLink } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';

const magicLinkSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email().optional(),
  scopes: z.array(z.string()).default([
    'formulas:read',
    'formulas:write',
    'dictionaries:read',
    'dictionaries:write',
    'backfill:run'
  ])
});

export const createMagicLink: RequestHandler = async (req, res, next) => {
  try {
    const payload = magicLinkSchema.parse(req.body);
    const { token, expiresAt } = await issueMagicLink({
      sub: payload.userId,
      workspaceId: CONFIG.WORKSPACE_ID,
      email: payload.email,
      scopes: payload.scopes
    });
    res.status(201).json({ token, expiresAt });
  } catch (error) {
    next(error);
  }
};
