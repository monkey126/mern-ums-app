import { Response } from "express";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  AppError,
} from "./errors";

export const handleControllerError = (error: any, res: Response): void => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  } else if (error instanceof AuthenticationError) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  } else if (error instanceof AuthorizationError) {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  } else if (error instanceof ConflictError) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  } else if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
    });
  } else {
    // For unexpected errors
    console.error("Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
