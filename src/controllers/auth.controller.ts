import type { Response, Request, NextFunction } from 'express'
import { loginAdmin } from '../services/auth.service.js'


export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await loginAdmin(req.body);
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
}
export function me(req: Request, res: Response) {
    return res.status(200).json({id: res.locals.adminId});
}