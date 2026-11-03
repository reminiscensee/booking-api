import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { createAppointmentSchema, getAdminAppointmentsQuerySchema } from '../schemas/appointment.schema.js';
import { create, getAll } from '../controllers/appointment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.post('/', validate(createAppointmentSchema, 'body'), create);

router.get('/', requireAuth, validate(getAdminAppointmentsQuerySchema, 'query'), getAll)

export default router;