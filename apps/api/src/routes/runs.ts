import { Router, type RequestHandler } from 'express';
import { getRuns } from '../controllers/runController.js';

const router: Router = Router();

router.get('/', getRuns);

export default router;
