import { Router } from 'express';
import { clockifyWebhookHandler } from '../controllers/webhookController.js';

const router: Router = Router();

router.post('/clockify', clockifyWebhookHandler);

export default router;
