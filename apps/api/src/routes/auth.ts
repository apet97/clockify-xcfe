import { Router, type RequestHandler } from 'express';
import { createMagicLink } from '../controllers/authController.js';

const router: Router = Router();

router.post('/magic-link', createMagicLink);

export default router;
