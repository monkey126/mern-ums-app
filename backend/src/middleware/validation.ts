import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodEffects } from "zod";
import logger from "../utils/logger";

export const validate = (schema: AnyZodObject | ZodEffects<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For most schemas, we validate just the body
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({ error: error.errors }, "Validation failed");
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};

// For query parameter validation
export const validateQuery = (schema: AnyZodObject | ZodEffects<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({ error: error.errors }, "Query validation failed");
        return res.status(400).json({
          success: false,
          message: "Query validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};
