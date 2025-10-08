import { Router, type RequestHandler } from 'express';
import healthRoutes from './health.js';
import webhookRoutes from './webhooks.js';
import formulaRoutes from './formulas.js';
import dictionaryRoutes from './dictionaries.js';
import backfillRoutes from './backfill.js';
import authRoutes from './auth.js';
import runsRoutes from './runs.js';
import settingsRoutes from './settings.js';
import proxyRoutes from './proxy.js';

const router: Router = Router();

router.use('/sites', healthRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/formulas', formulaRoutes);
router.use('/dictionaries', dictionaryRoutes);
router.use('/backfill', backfillRoutes);
router.use('/auth', authRoutes);
router.use('/runs', runsRoutes);
router.use('/settings', settingsRoutes);
router.use('/proxy', proxyRoutes);

export default router;
