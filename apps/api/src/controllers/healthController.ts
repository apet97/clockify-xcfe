import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';

export const healthCheck: RequestHandler = async (_req, res) => {
  res.json({ status: 'ok', workspaceId: CONFIG.WORKSPACE_ID, timestamp: new Date().toISOString() });
};
