import type { Response, Request, NextFunction } from 'express';
import { createSlot, generateSlotByAdmin, getAdminSlots, getAvailableSlots, updateSlot } from '../services/slot.service.js';

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
export async function getFreeSlots(req: Request, res: Response, next: NextFunction) {
    try {
        const date = String(req.query.date);
        const getDate = await getAvailableSlots(date);
        return res.status(200).json(getDate);
    } catch (e) {
        next(e);
    };
}
export async function getSlotsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const date = String(req.query.date);
        const result = await getAdminSlots(date);
        return res.status(200).json(result);
    } catch (e) {
        next(e)
    };
}
export async function generateSlotsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await generateSlotByAdmin(req.body);
    return res.status(201).json({ created });
  } catch (e) {
    next(e);
  }
}