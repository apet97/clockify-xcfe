import { Router } from 'express';
import { proxyTimeEntries } from '../controllers/proxyController.js';

const router: Router = Router();

router.get('/time-entries', proxyTimeEntries);

export default router;