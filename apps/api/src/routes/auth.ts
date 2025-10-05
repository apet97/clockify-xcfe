import { Router } from 'express';
import { createMagicLink } from '../controllers/authController.js';

const router = Router();

router.post('/magic-link', createMagicLink);

export default router;
