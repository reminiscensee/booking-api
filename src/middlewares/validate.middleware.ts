import type { NextFunction, Request, Response } from "express";
import { type ZodSchema } from "zod";
import { AppError } from "../errors/app.error.js";

export const validate = (schema: ZodSchema, target: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[target]);
      if (!result.success) {
        throw new AppError (result.error.issues[0]?.message ?? 'Validation error', 400);
      };
      if (target === 'query') {
        res.locals.query = result.data
      } else if (target === 'body') {
        req.body = result.data
      } else if (target === 'params') {
        Object.assign(req.params, result.data as object);
      };
      return next();
    } catch (e) {
      next(e);
    };
  };
};