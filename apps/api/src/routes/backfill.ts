import { Router } from 'express';
import { executeBackfill } from '../controllers/backfillController.js';

const router: Router = Router();

router.post('/', executeBackfill);

export default router;
