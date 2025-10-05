import { Router } from 'express';
import {
  getDictionaries,
  upsertDictionaryHandler,
  removeDictionaryHandler
} from '../controllers/formulaController.js';

const router: Router = Router();

router.get('/', getDictionaries);
router.post('/', upsertDictionaryHandler);
router.delete('/:fieldKey', removeDictionaryHandler);

export default router;
