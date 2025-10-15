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
import debugRoutes from './debug.js';
import meRoutes from './me.js';
import cfRoutes from './cf.js';
import manifestRoutes from './manifest.js';

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
router.use('/debug', debugRoutes);
router.use('/me', meRoutes);
router.use('/cf', cfRoutes);
router.use('/api/manifest', manifestRoutes);

export default router;
