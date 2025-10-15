import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  listFormulas,
  createFormula,
  updateFormula,
  deleteFormula,
  listDictionaries,
  upsertDictionary,
  deleteDictionary
} from '../services/formulaService.js';
import { CONFIG } from '../config/index.js';
import { verifyMagicLink, verifyClockifyJwt } from '../lib/jwt.js';
import type { Request } from 'express';

const extractAuthToken = (req: Request): string | null => {
  const authHeader = req.header('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]?.trim()) return match[1].trim();
  }
  const token = req.query.auth_token;
  if (typeof token === 'string' && token.trim()) return token.trim();
  return null;
};

const resolveWorkspaceId = async (req: Request): Promise<string> => {
  const token = extractAuthToken(req);
  if (!token) throw Object.assign(new Error('Missing authentication token'), { statusCode: 401 });
  try {
    // Prefer magic-link bearer; fallback to iframe JWT
    if ((req.header('authorization') || '').startsWith('Bearer ')) {
      const claims = await verifyMagicLink(token);
      return claims.workspaceId;
    }
    const claims = await verifyClockifyJwt(token, CONFIG.ADDON_KEY);
    return claims.workspaceId;
  } catch {
    throw Object.assign(new Error('Invalid authentication token'), { statusCode: 401 });
  }
};
import { webhookEventTypeSchema } from '../types/clockify.js';

const upsertSchema = z.object({
  fieldKey: z.string().min(1),
  expr: z.string().min(1),
  priority: z.coerce.number().int().min(0).default(0),
  onEvents: z.array(webhookEventTypeSchema).default([])
});

const dictionarySchema = z.object({
  fieldKey: z.string().min(1),
  type: z.enum(['dropdown', 'numeric']).default('dropdown'),
  allowedValues: z.array(z.string()).optional(),
  numericRange: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
  mode: z.enum(['warn', 'block', 'autofix']).default('warn')
});

export const getFormulas: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    const formulas = await listFormulas(workspaceId);
    res.json({ formulas });
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const postFormula: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    const payload = upsertSchema.parse(req.body);
    const created = await createFormula(workspaceId, {
      fieldKey: payload.fieldKey,
      expr: payload.expr,
      priority: payload.priority,
      onEvents: payload.onEvents
    });
    res.status(201).json({ formula: created });
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const putFormula: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    const payload = upsertSchema.parse(req.body);
    await updateFormula(workspaceId, req.params.id, {
      fieldKey: payload.fieldKey,
      expr: payload.expr,
      priority: payload.priority,
      onEvents: payload.onEvents
    });
    res.json({ ok: true });
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const removeFormula: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    await deleteFormula(workspaceId, req.params.id);
    res.status(204).send();
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const getDictionaries: RequestHandler = async (req, res, next) => {
  try {
    await resolveWorkspaceId(req); // auth gate only
    const dictionaries = await listDictionaries();
    res.json({ dictionaries });
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const upsertDictionaryHandler: RequestHandler = async (req, res, next) => {
  try {
    await resolveWorkspaceId(req); // auth gate only
    const payload = dictionarySchema.parse(req.body);
    await upsertDictionary(payload.fieldKey, {
      type: payload.type,
      allowedValues: payload.allowedValues,
      numericRange: payload.numericRange,
      mode: payload.mode
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};

export const removeDictionaryHandler: RequestHandler = async (req, res, next) => {
  try {
    await resolveWorkspaceId(req); // auth gate only
    const fieldKey = z.string().parse(req.params.fieldKey);
    await deleteDictionary(fieldKey);
    res.status(204).send();
  } catch (error) {
    const sc = (error as any).statusCode || 500;
    res.status(sc).json({ error: (error as Error).message });
  }
};
