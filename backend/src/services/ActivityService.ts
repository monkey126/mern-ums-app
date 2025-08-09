import { prisma } from "../lib/prisma";
import { ErrorMessages, NotFoundError } from "../utils/errors";
import logger from "../utils/logger";

export class ActivityService {
  /**
   * Get user activities with filtering and pagination
   * Supports search by activity text and filtering by activity type
   */
  static async getUserActivities(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      activity?: string;
    }
  ) {
    const { page = 1, limit = 10, search, activity } = options;

    // Build where clause with filters
    const whereClause: any = {
      userId,
    };

    // Add search filter if provided
    if (search && search.trim()) {
      whereClause.OR = [
        {
          activity: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          details: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    // Add activity type filter if provided
    if (activity && activity.trim()) {
      whereClause.activity = {
        contains: activity.trim(),
        mode: "insensitive",
      };
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    const total = await prisma.activityLog.count({
      where: whereClause,
    });

    logger.info(
      {
        userId,
        action: "Viewed activity logs",
        page,
        limit,
        total,
        search,
        activity,
      },
      "User viewed activity logs with filters"
    );

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get activity by ID
  static async getActivityById(activityId: string, userId: string) {
    const activity = await prisma.activityLog.findFirst({
      where: {
        id: activityId,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundError(ErrorMessages.RESOURCE_NOT_FOUND);
    }

    logger.info(
      {
        userId,
        action: "Viewed activity",
        activityId,
      },
      "User viewed specific activity"
    );

    return { activity };
  }
}
