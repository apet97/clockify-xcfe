import { Router } from 'express';
import { getManifest } from '../controllers/manifestController.js';

const router: Router = Router();

router.get('/', getManifest);

export default router;