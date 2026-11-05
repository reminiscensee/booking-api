import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { getAllAdmin } from '../controllers/service.controller.js';
import { getSlotsAdmin } from '../controllers/slot.controller.js';
import { getSlotsQuerySchema } from '../schemas/slot.schema.js';

const router: Router = Router();

router.get('/services', getAllAdmin);
router.get('/slots', validate(getSlotsQuerySchema, 'query'), getSlotsAdmin);

export default router;