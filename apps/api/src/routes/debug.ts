import { Router, type RequestHandler } from 'express';
import { getLastLifecycleEvent } from '../lib/lifecycleTracker.js';

const router: Router = Router();

const getLastLifecycle: RequestHandler = (req, res) => {
  const lastEvent = getLastLifecycleEvent();

  if (!lastEvent) {
    return res.status(200).json({ event: null, message: 'No lifecycle events recorded yet' });
  }

  res.status(200).json(lastEvent);
};

router.get('/last-lifecycle', getLastLifecycle);

export default router;
