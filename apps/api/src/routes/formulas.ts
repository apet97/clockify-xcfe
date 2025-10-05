import { Router, type RequestHandler } from 'express';
import { getFormulas, postFormula, putFormula, removeFormula } from '../controllers/formulaController.js';

const router: Router = Router();

router.get('/', getFormulas);
router.post('/', postFormula);
router.put('/:id', putFormula);
router.delete('/:id', removeFormula);

export default router;
