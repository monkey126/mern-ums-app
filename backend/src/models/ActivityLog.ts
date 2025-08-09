import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

/**
 * Activity Log Model
 * Data access layer for user activity logging
 * Tracks user actions for security and audit purposes
 */
export class ActivityLogModel {
  /**
   * Create new activity log entry
   */
  static async create(data: Prisma.ActivityLogCreateInput) {
    return await prisma.activityLog.create({
      data,
    });
  }

  /**
   * Get activities for a specific user
   */
  static async getUserActivities(userId: string, limit = 50) {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get all activities with user information (admin only)
   */
  static async getAllActivities(limit = 100) {
    return await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
