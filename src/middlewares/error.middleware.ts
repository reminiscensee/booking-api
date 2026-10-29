import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";

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
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
}