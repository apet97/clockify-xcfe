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

export const getFormulas: RequestHandler = async (_req, res, next) => {
  try {
    const formulas = await listFormulas(CONFIG.WORKSPACE_ID);
    res.json({ formulas });
  } catch (error) {
    next(error);
  }
};

export const postFormula: RequestHandler = async (req, res, next) => {
  try {
    const payload = upsertSchema.parse(req.body);
    const created = await createFormula(CONFIG.WORKSPACE_ID, {
      fieldKey: payload.fieldKey,
      expr: payload.expr,
      priority: payload.priority,
      onEvents: payload.onEvents
    });
    res.status(201).json({ formula: created });
  } catch (error) {
    next(error);
  }
};

export const putFormula: RequestHandler = async (req, res, next) => {
  try {
    const payload = upsertSchema.parse(req.body);
    await updateFormula(CONFIG.WORKSPACE_ID, req.params.id, {
      fieldKey: payload.fieldKey,
      expr: payload.expr,
      priority: payload.priority,
      onEvents: payload.onEvents
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const removeFormula: RequestHandler = async (req, res, next) => {
  try {
    await deleteFormula(CONFIG.WORKSPACE_ID, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getDictionaries: RequestHandler = async (_req, res, next) => {
  try {
    const dictionaries = await listDictionaries();
    res.json({ dictionaries });
  } catch (error) {
    next(error);
  }
};

export const upsertDictionaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const payload = dictionarySchema.parse(req.body);
    await upsertDictionary(payload.fieldKey, {
      type: payload.type,
      allowedValues: payload.allowedValues,
      numericRange: payload.numericRange,
      mode: payload.mode
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const removeDictionaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const fieldKey = z.string().parse(req.params.fieldKey);
    await deleteDictionary(fieldKey);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
