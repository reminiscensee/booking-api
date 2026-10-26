import express, { type Application } from "express";
import healthRouter from './routes/health.router.js'

const app: Application = express();

app.use(express.json());

app.use('/api/v1', healthRouter);

export default app