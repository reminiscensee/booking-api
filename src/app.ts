import express, { type Application } from "express";
import healthRouter from './routes/health.router.js'
import serviceRouter from './routes/service.routes.js'
import authRouter from './routes/auth.routes.js';
import { globalError } from "./middlewares/error.middleware.js";
import { notFoundError } from "./middlewares/not-found.middleware.js";

const app: Application = express();

app.use(express.json());

app.use('/api/v1', healthRouter);

app.use('/api/v1/services', serviceRouter);

app.use('/api/v1/auth', authRouter)

app.use(notFoundError);

app.use(globalError);

export default app