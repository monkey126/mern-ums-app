import { Response } from "express";
import { AdminService } from "../services";
import { AuthenticatedRequest } from "../types";
import { getRequestInfo } from "../utils/requestHelper";
import { handleControllerError } from "../utils/handleControllerError";

export class AdminController {
  // Get all users
  static async getUsers(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const {
        page = "1",
        limit = "10",
        role,
        status,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const result = await AdminService.getUsers({
        page: page as string,
        limit: limit as string,
        role: role as string,
        status: status as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get single user
  static async getUserById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await AdminService.getUserById(id!);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update user
  static async updateUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, role, status } = req.body;

      const result = await AdminService.updateUser(
        id!,
        { name, email, phone, role, status },
        {
          adminId: req.user?.id!,
          adminRole: req.user?.role!,
          ...getRequestInfo(req),
        }
      );

      res.json({
        success: true,
        message: "User updated successfully",
        data: result,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  // Delete user
  static async deleteUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await AdminService.deleteUser(id!, {
        adminId: req.user?.id!,
        ...getRequestInfo(req),
      });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      let statusCode = 400;
      if (error.message === "User not found") statusCode = 404;
      if (error.message.includes("cannot be deleted")) statusCode = 403;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get system stats
  static async getStats(
    _req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const result = await AdminService.getStats();

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get activity logs
  static async getActivityLogs(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { 
        page = "1", 
        limit = "10", 
        userId,
        activity,
        search 
      } = req.query;

      const result = await AdminService.getActivityLogs({
        page: Number(page),
        limit: Number(limit),
        userId: userId as string,
        activity: activity as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
