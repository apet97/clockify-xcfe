import { Router } from 'express';
import { 
  handleInstalled, 
  handleStatusChanged, 
  handleSettingsUpdated, 
  handleDeleted 
} from '../controllers/lifecycleController.js';

const router: Router = Router();

router.post('/installed', handleInstalled);
router.post('/status', handleStatusChanged);
router.post('/settings', handleSettingsUpdated);
router.post('/deleted', handleDeleted);

export default router;