import { Router } from 'express';
import { getRuns } from '../controllers/runController.js';

const router = Router();

router.get('/', getRuns);

export default router;
