import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { createAppointmentSchema } from '../schemas/appointment.schema.js';
import { create } from '../controllers/appointment.controller.js';

const router: Router = Router();

router.post('/', validate(createAppointmentSchema, 'body'), create);

export default router;