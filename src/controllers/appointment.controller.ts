import type { Response, Request, NextFunction } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../services/appointment.service.js';
import type { getAdminAppointmentsInput } from '../schemas/appointment.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        const createdData = await createAppointment(data);
        return res.status(201).json(createdData);
    } catch (e) {
        next(e)
    }
}
export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.query as unknown as getAdminAppointmentsInput
        const appointments = await getAppointments(data);
        res.status(200).json(appointments)
    } catch (e) {
        next(e);
    };
}
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const body = req.body.status;
        const updatedAppointment = await updateAppointmentStatus(id, body);
        res.status(200).json(updatedAppointment)
    } catch (e) {
        next(e)
    }
}