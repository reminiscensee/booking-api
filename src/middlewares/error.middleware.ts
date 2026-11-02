import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
const DB_ERRORS: Record<string, string> = {
  uq_time_slots_starts_at: 'Time slot with this start time already exists',
  uq_admin_users_email: 'An administrator with this email already exists',
  chk_services_price: 'Service price must be a positive number',
  chk_time_slots_duration: 'End time must be after start time',
  fk_appointments_slot: 'Selected time slot does not exist',
  fk_appointments_customer: 'Associated customer does not exist',
  fk_appointments_service: 'Selected service does not exist',
  chk_appointments_status: 'Invalid appointment status',
  uq_appointments_active_slot: 'This time slot has already been booked',
};

export function globalError(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message })
    }
    if (
        err instanceof SyntaxError &&
        'status' in err &&
        err.status === 400 &&
        'body' in err
    ) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
   
    if (typeof err === 'object' && err !== null && 'code' in err) {
        const dbErr = err as { code: string; constraint?: string };
        const message = dbErr.constraint ? DB_ERRORS[dbErr.constraint] : undefined
        if(dbErr.code === '23505') {
            return res.status(409).json({ error: message || 'Resource already exists'});
        };
        if(dbErr.code === '23503' || dbErr.code ===  '23514') {
            return res.status(400).json({ error: message || 'Invalid data or reference' });
        }
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
}