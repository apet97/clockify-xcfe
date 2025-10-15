import { Router, type RequestHandler } from 'express';
import { healthCheck, readinessCheck } from '../controllers/healthController.js';

const router: Router = Router();

router.get('/health', healthCheck);
router.get('/ready', readinessCheck);

export default router;
