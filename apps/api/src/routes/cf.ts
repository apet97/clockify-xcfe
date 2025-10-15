import { Router } from 'express';
import { getCustomFields } from '../controllers/cfController.js';

const router: Router = Router();

router.get('/fields', getCustomFields);

export default router;
