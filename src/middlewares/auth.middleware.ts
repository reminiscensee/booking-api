import type { Response, Request, NextFunction } from 'express'
import { AppError } from '../errors/app.error.js';
import { env } from '../config/env.js';
import jwt from 'jsonwebtoken'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const bearer = req.headers.authorization;
    if(!bearer) {
        throw new AppError('Unauthorized', 401);
    }
    const token = bearer.split(' ')[1];
    if(!token) {
        throw new AppError('Unauthorized', 401);
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as {id: number};
        res.locals.adminId = payload.id
        next();
    } catch {
        next(new AppError('Unauthorized', 401))
    };
}