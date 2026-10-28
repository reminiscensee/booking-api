import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";

export function globalError(err: unknown, req: Request, res: Response, next: NextFunction) {
    if(err instanceof AppError) {
        return res.status(err.statusCode).json({error: err.message})
    }
    console.error(err);
    return res.status(500).json({error: 'Internal Server Error'});
}