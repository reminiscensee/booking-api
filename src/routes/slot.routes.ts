import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { update, create, getFreeSlots } from '../controllers/slot.controller.js';
import { createSlotSchema, getSlotsQuerySchema, slotIdSchema, updateSlotSchema } from '../schemas/slot.schema.js';

const router: Router = Router();

router.post('/', requireAuth, validate(createSlotSchema, 'body'), create);

router.patch('/:id', requireAuth, validate(slotIdSchema, 'params'), validate(updateSlotSchema, 'body'), update);

router.get('/', validate(getSlotsQuerySchema, 'query'), getFreeSlots);

export default router;