import type { RequestHandler } from 'express';
import { z } from 'zod';
import { CONFIG } from '../config/index.js';

const settingsSchema = z.object({
  strict_mode: z.boolean(),
  reference_months: z.number().int().min(1).max(12),
  region: z.string().optional()
});

type Settings = z.infer<typeof settingsSchema>;

// In-memory settings store - in a real app this would be in the database
let currentSettings: Settings = {
  strict_mode: false,
  reference_months: 3,
  region: CONFIG.CLOCKIFY_REGION
};

export const getSettings: RequestHandler = async (_req, res) => {
  res.json(currentSettings);
};

export const updateSettings: RequestHandler = async (req, res) => {
  const settings = settingsSchema.parse(req.body);
  currentSettings = { ...currentSettings, ...settings };
  res.json(currentSettings);
};