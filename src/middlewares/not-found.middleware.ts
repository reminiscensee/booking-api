import { AppError } from "../errors/app.error.js";
import type { Request, Response, NextFunction } from "express";

export async function notFoundError(req: Request, res: Response, next: NextFunction) {
    next(new AppError('Route not found', 404));
};