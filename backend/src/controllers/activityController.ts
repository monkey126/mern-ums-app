import { Response } from "express";
import { ActivityService } from "../services";
import { AuthenticatedRequest } from "../types";
import { handleControllerError } from "../utils/handleControllerError";

/**
 * Activity Controller
 * Handles user activity log operations including:
 * - Retrieving user activities with filtering
 * - Activity search and pagination
 * - Individual activity retrieval
 */
export class ActivityController {
  /**
   * Get user activities with filtering and pagination
   * Supports search and activity type filtering
   */
  static async getUserActivities(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const search = req.query["search"] as string;
      const activity = req.query["activity"] as string;

      const result = await ActivityService.getUserActivities(userId, {
        page,
        limit,
        search,
        activity,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  /**
   * Get specific activity by ID
   * Returns activity details for the authenticated user
   */
  static async getActivityById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const activityId = req.params["id"];
      if (!activityId) {
        res.status(400).json({
          success: false,
          message: "Activity ID is required",
        });
        return;
      }

      const result = await ActivityService.getActivityById(activityId, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      let statusCode = 400;
      if (error.message === "Activity not found") statusCode = 404;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}
