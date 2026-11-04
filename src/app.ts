import express, { type Application } from "express";
import cors from 'cors';
import healthRouter from './routes/health.router.js'
import serviceRouter from './routes/service.routes.js'
import authRouter from './routes/auth.routes.js';
import slotRouter from './routes/slot.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import { globalError } from "./middlewares/error.middleware.js";
import { notFoundError } from "./middlewares/not-found.middleware.js";
import { env } from './config/env.js'

const app: Application = express();

app.use(cors({
    origin: [env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/v1', healthRouter);

app.use('/api/v1/services', serviceRouter);

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/slots', slotRouter);

app.use('/api/v1/appointments', appointmentRouter);

app.use(notFoundError);

app.use(globalError);

export default app