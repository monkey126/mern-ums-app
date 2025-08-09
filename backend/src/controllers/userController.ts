import { Response } from "express";
import { UserService } from "../services";
import { AuthenticatedRequest } from "../types";
import { getRequestInfo } from "../utils/requestHelper";
import { handleControllerError } from "../utils/handleControllerError";

export class UserController {
  // Get user profile
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const result = await UserService.getProfile(req.user?.id!);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  // Update user profile
  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { name, phone } = req.body;

      const result = await UserService.updateProfile(
        req.user?.id!,
        { name, phone },
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  // Change password
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      const result = await UserService.changePassword(
        req.user?.id!,
        { currentPassword, newPassword, confirmPassword },
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const uploadData = req.body;

      const result = await UserService.uploadProfilePicture(
        req.user?.id!,
        uploadData,
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: result,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }
}
