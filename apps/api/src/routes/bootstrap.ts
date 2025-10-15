import { Router, type Request, type Response } from 'express';
import { ensureWebhooks } from '../services/webhookRegistrar.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

const router: Router = Router();

const isAuthorized = (req: Request): boolean => {
  const headerSecret = (req.headers['x-admin-secret'] as string | undefined)?.trim();
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const secret = headerSecret || bearer || '';
  if (!secret) return false;
  return secret === CONFIG.ENCRYPTION_KEY;
};

// Liveness and usage hint
router.get('/webhooks/bootstrap', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    route: '/api/webhooks/bootstrap',
    method: 'POST',
    auth: 'Send X-Admin-Secret or Authorization: Bearer <ENCRYPTION_KEY>'
  });
});

// Trigger webhook registration on demand (useful on serverless cold starts)
router.post('/webhooks/bootstrap', async (req: Request, res: Response) => {
  try {
    const inProd = CONFIG.NODE_ENV === 'production';
    if (inProd && !isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!CONFIG.ADDON_ID || !CONFIG.WEBHOOK_PUBLIC_URL) {
      return res.status(400).json({
        error: 'Missing ADDON_ID or WEBHOOK_PUBLIC_URL',
        hint: 'Set ADDON_ID and WEBHOOK_PUBLIC_URL in environment'
      });
    }

    const webhookIds = await ensureWebhooks();
    res.status(200).json({ ok: true, webhookIds });
  } catch (err) {
    logger.error({ err }, 'Failed to bootstrap webhooks');
    res.status(500).json({ error: 'Webhook bootstrap failed' });
  }
});

export default router;

