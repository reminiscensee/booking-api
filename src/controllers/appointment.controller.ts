import type { Response, Request, NextFunction } from 'express';
import { createAppointment } from '../services/appointment.service.js';

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        const createdData = await createAppointment(data);
        return res.status(201).json(createdData);
    } catch (e) {
        next(e)
    }

}