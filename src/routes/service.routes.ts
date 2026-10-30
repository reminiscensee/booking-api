import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { getAll, getById, create, update } from '../controllers/service.controller.js';
import { createServiceSchema, serviceIdSchema, updateServiceSchema } from '../schemas/service.schema.js';

const router: Router = Router();

router.get('/', getAll);
router.get('/:id', validate(serviceIdSchema, 'params'), getById);
router.post('/', validate(createServiceSchema, 'body'), create);
router.patch('/:id', validate(serviceIdSchema, 'params'), validate(updateServiceSchema, 'body'), update);

export default router;