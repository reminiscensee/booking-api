import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { appointmentIdSchema, createAppointmentSchema, getAdminAppointmentsQuerySchema, updateAppointmentsStatusSchema } from '../schemas/appointment.schema.js';
import { create, getAll, updateStatus } from '../controllers/appointment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.post('/', validate(createAppointmentSchema, 'body'), create);

router.get('/', requireAuth, validate(getAdminAppointmentsQuerySchema, 'query'), getAll);

router.patch('/:id', requireAuth, validate(appointmentIdSchema, 'params'), validate(updateAppointmentsStatusSchema, 'body'), updateStatus);

export default router;