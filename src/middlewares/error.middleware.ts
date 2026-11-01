import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
const DB_ERRORS: Record<string, string> = {
  uq_time_slots_starts_at: 'Time slot with this start time already exists',
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
        const message = (dbErr.constraint && DB_ERRORS[dbErr.constraint]) || 'Resource conflict';
        if(dbErr.code === '23505') {
            return res.status(409).json({ error: message })
        }
        if(dbErr.code === '23503' || dbErr.code ===  '23514') {
            return res.status(400).json({ error: message })
        }
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
}