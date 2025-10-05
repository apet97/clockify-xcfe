import { Router } from 'express';
import { executeBackfill } from '../controllers/backfillController.js';

const router = Router();

router.post('/', executeBackfill);

export default router;
