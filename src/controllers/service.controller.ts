import type { Response, Request, NextFunction } from 'express';
import { findAllActiveServices, updateService, createService, findServiceById, getAllServicesAdmin } from "../services/service.service.js";

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const findService = await findAllActiveServices();
        return res.status(200).json(findService);
    } catch (e) {
        next(e);
    };
};
export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id)
        const getServiceById = await findServiceById(id);
        return res.status(200).json(getServiceById);
    } catch (e) {
        next(e);
    };
};
export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const newService = await createService(req.body);
        return res.status(201).json(newService);
    } catch (e) {
        next(e);
    };
};
export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const updatedService = await updateService(id, req.body);
        return res.status(200).json(updatedService);
    } catch (e) {
        next(e);
    };
};
export async function getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await getAllServicesAdmin();
        return res.status(200).json(result);
    } catch (e) {
        next(e);
    };
}