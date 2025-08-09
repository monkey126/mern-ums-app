import { Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(401).json({
        success: false,
        message: "Account is not active",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error({ error }, "Authentication error");
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      });
      return;
    }

    next();
  };
};

export const isAdmin = authorize(UserRole.ADMIN);
export const admin = authorize(UserRole.ADMIN);
export const canManageUsers = authorize(UserRole.ADMIN);
export const canViewActivityLogs = authorize(
  UserRole.ADMIN,
  UserRole.DEVELOPER,
  UserRole.MODERATOR
);
