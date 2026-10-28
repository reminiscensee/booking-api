import express, { type Application } from "express";
import healthRouter from './routes/health.router.js'
import { globalError } from "./middlewares/error.middleware.js";
import { notFoundError } from "./middlewares/not-found.middleware.js";

const app: Application = express();

app.use(express.json());

app.use('/api/v1', healthRouter);

app.use(notFoundError);

app.use(globalError);

export default app