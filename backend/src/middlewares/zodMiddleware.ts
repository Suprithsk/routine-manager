import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const zodPostMiddleware = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: error.errors });
            }
        }
    };
}