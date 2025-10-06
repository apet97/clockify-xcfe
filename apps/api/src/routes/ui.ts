import { Router } from 'express';
import { renderSidebar } from '../controllers/uiController.js';

const router: Router = Router();

router.get('/sidebar', renderSidebar);

export default router;