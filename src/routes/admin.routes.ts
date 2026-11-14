import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { getAllAdmin } from '../controllers/service.controller.js';
import { generateSlotsAdmin, getSlotsAdmin } from '../controllers/slot.controller.js';
import { generateSlotsSchema, getSlotsQuerySchema } from '../schemas/slot.schema.js';

const router: Router = Router();

router.get('/services', getAllAdmin);
router.get('/slots', validate(getSlotsQuerySchema, 'query'), getSlotsAdmin);
router.post('/slots/generate', validate(generateSlotsSchema, 'body'), generateSlotsAdmin);

export default router;