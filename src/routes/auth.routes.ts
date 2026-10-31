import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post('/login', validate(loginSchema, 'body'), login);

router.get('/me', requireAuth, me);

export default router