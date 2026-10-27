import type { Response, Request, NextFunction } from 'express'
import { getDbHealthStatus, getHealthStatus } from "../services/health.service.js"

export const getHealth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = getHealthStatus();
        res.status(200).json(data)
    } catch (e) {
        next(e)
    }
}

export async function getDbStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await getDbHealthStatus();
        res.status(200).json(data);
    } catch (e) {
        next(e);
    };
};