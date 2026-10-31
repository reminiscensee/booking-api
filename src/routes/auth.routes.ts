import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { login } from "../controllers/auth.controller.js";

const router: Router = Router();

router.post('/login', validate(loginSchema, 'body'), login);

export default router