import { Router, type RequestHandler } from 'express';
import { healthCheck } from '../controllers/healthController.js';

const router: Router = Router();

router.get('/health', healthCheck);

export default router;
