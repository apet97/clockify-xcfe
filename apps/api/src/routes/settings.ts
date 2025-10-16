import { Router, type Router as RouterType } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router: RouterType = Router();

router.get('/', getSettings);
router.post('/', updateSettings);
router.patch('/', updateSettings);

export default router;
