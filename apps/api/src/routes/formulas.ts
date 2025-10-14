import { Router, type RequestHandler } from 'express';
import { getFormulas, postFormula, putFormula, removeFormula } from '../controllers/formulaController.js';
import { recompute, verify } from '../controllers/formulasController.js';

const router: Router = Router();

router.get('/', getFormulas);
router.post('/', postFormula);
router.put('/:id', putFormula);
router.delete('/:id', removeFormula);

// Recompute endpoint - POST only, return 405 JSON for other methods
router.get('/recompute', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed', message: 'Use POST to recompute formulas' });
});
router.post('/recompute', recompute);

// Verify endpoint - GET only, for read-back verification
router.get('/verify', verify);

export default router;
