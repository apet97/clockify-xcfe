import { Router } from 'express';
import { renderSidebar, renderSettings } from '../controllers/uiController.js';

const router: Router = Router();

router.get('/sidebar', renderSidebar);
router.get('/settings', renderSettings);
router.get('/settings/:config', renderSettings);

export default router;