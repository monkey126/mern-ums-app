import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  logger.error({
    err,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        return res.status(409).json({
          success: false,
          status: "fail",
          message: "A record with this value already exists",
        });
      case "P2025": // Record not found
        return res.status(404).json({
          success: false,
          status: "fail",
          message: "Record not found",
        });
      default:
        return res.status(400).json({
          success: false,
          status: "fail",
          message: "Database operation failed",
        });
    }
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.reduce((acc: Record<string, string[]>, curr) => {
      const path = curr.path.join(".");
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(curr.message);
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      status: "fail",
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      status: "fail",
      message: "Token expired",
    });
  }

  // Handle all other errors
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    status: "error",
    message:
      process.env["NODE_ENV"] === "production"
        ? "Something went wrong"
        : err.message,
  });
};
