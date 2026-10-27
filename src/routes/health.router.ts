import { Router } from "express";
import { getHealth, getDbStatus } from "../controllers/health.controller.js";

const router: Router = Router();

router.get('/health', getHealth);

router.get('/health/db', getDbStatus)

export default router