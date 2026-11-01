import type { Response, Request, NextFunction } from 'express';
import { createSlot, updateSlot } from '../services/slot.service.js';

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        const createdData = await createSlot(data);
        return res.status(201).json(createdData);
    } catch (e) {
        next(e);
    };
}
export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const getUpdatedSlot = await updateSlot(id, req.body);
        return res.status(200).json(getUpdatedSlot);
    } catch (e) {
        next(e);
    };
}