import { prisma } from "../lib/prisma";
import { ActivityLogModel, UserModel } from "../models";
import {
  adminUserUpdateSchema,
  queryParamsSchema,
} from "../schemas/validation";
import {
  AuthorizationError,
  ErrorMessages,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import logger from "../utils/logger";
import { RequestInfo } from "../utils/requestHelper";

export class AdminService {
  // Helper method to validate role transitions
  private static isValidRoleTransition(
    currentRole: string,
    newRole: string
  ): boolean {
    // Define allowed role transitions
    const allowedTransitions: Record<string, string[]> = {
      CLIENT: ["DEVELOPER", "MODERATOR"],
      DEVELOPER: ["CLIENT", "MODERATOR"],
      MODERATOR: ["CLIENT", "DEVELOPER"],
      ADMIN: ["ADMIN"], // Admin role can only be assigned by superadmin through different process
    };

    return allowedTransitions[currentRole]?.includes(newRole) || false;
  }

  // Helper method to validate status transitions
  private static isValidStatusTransition(
    currentStatus: string,
    newStatus: string
  ): boolean {
    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      ACTIVE: ["INACTIVE", "SUSPENDED"],
      INACTIVE: ["ACTIVE", "SUSPENDED"],
      SUSPENDED: ["INACTIVE"], // Suspended users must go through inactive state first
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }
  // Get all users with pagination and filtering
  static async getUsers(filters: Record<string, string>) {
    // Validate and transform query parameters
    const validatedFilters = queryParamsSchema.parse(filters);

    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = validatedFilters;

    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            activityLogs: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count
    const total = await prisma.user.count({ where });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single user by ID
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        activityLogs: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    return { user };
  }

  // Update user
  static async updateUser(
    id: string,
    updateData: Record<string, unknown>,
    adminInfo: {
      adminId: string;
      adminRole: string;
    } & RequestInfo
  ) {
    // Validate update data
    const validatedData = adminUserUpdateSchema.parse(updateData);

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    // Prevent admin from modifying other admins unless they're a super admin
    if (existingUser.role === "ADMIN" && adminInfo.adminRole !== "ADMIN") {
      throw new AuthorizationError(ErrorMessages.FORBIDDEN);
    }

    // Prevent self-role modification
    if (
      id === adminInfo.adminId &&
      validatedData.role &&
      validatedData.role !== existingUser.role
    ) {
      throw new ValidationError("Cannot modify your own role", {
        role: ["Administrators cannot modify their own role"],
      });
    }

    // Validate role transition - only if role is actually being changed
    if (
      validatedData.role &&
      validatedData.role !== existingUser.role &&
      !this.isValidRoleTransition(existingUser.role, validatedData.role)
    ) {
      throw new ValidationError("Invalid role transition", {
        role: [
          `Cannot change user role from ${existingUser.role} to ${validatedData.role}`,
        ],
      });
    }

    // Validate status transition - only if status is actually being changed
    if (
      validatedData.status &&
      validatedData.status !== existingUser.status &&
      !this.isValidStatusTransition(existingUser.status, validatedData.status)
    ) {
      throw new ValidationError("Invalid status transition", {
        status: [
          `Cannot change user status from ${existingUser.status} to ${validatedData.status}`,
        ],
      });
    }

    // Update user
    const updateFields: any = {};
    if (validatedData.name) updateFields.name = { set: validatedData.name };
    if (validatedData.email) updateFields.email = { set: validatedData.email };
    if (validatedData.phone) updateFields.phone = { set: validatedData.phone };
    if (validatedData.role) updateFields.role = { set: validatedData.role };
    if (validatedData.status)
      updateFields.status = { set: validatedData.status };

    const user = await UserModel.update(id, updateFields);

    // Create activity log
    await ActivityLogModel.create({
      user: { connect: { id: adminInfo.adminId } },
      activity: "User updated by admin",
      details: JSON.stringify({
        updatedUser: user.email,
        updatedFields: Object.keys(updateData),
      }),
      ipAddress: adminInfo.ip || null,
      userAgent: adminInfo.userAgent || "Unknown",
    });

    logger.info(
      {
        adminId: adminInfo.adminId,
        action: "User updated",
        targetUser: user.email,
        updatedFields: Object.keys(updateData),
      },
      "Admin updated user"
    );

    return { user };
  }

  // Delete user
  static async deleteUser(
    id: string,
    adminInfo: { adminId: string } & RequestInfo
  ) {
    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    // Prevent deleting admins
    if (user.role === "ADMIN") {
      throw new AuthorizationError("Admin users cannot be deleted");
    }

    // Prevent self-deletion
    if (id === adminInfo.adminId) {
      throw new ValidationError("Cannot delete your own account", {
        user: ["Administrators cannot delete their own account"],
      });
    }

    // Validate user status
    if (user.status !== "INACTIVE") {
      throw new ValidationError("Cannot delete active user", {
        status: ["User must be inactive before deletion"],
      });
    }

    // Delete profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.includes("cloudinary.com")) {
      try {
        const { CloudinaryService } = await import("../lib/cloudinary");
        const publicId = CloudinaryService.extractPublicId(user.profilePicture);
        await CloudinaryService.deleteImage(publicId);
        logger.info(
          { publicId, userId: id },
          "Profile picture deleted from Cloudinary during user deletion"
        );
      } catch (error) {
        logger.warn(
          { error, userId: id },
          "Failed to delete profile picture from Cloudinary during user deletion"
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Create activity log
    await ActivityLogModel.create({
      user: { connect: { id: adminInfo.adminId } },
      activity: "User deleted by admin",
      details: JSON.stringify({
        deletedUser: user.email,
        hadProfilePicture: !!user.profilePicture,
      }),
      ipAddress: adminInfo.ip || null,
      userAgent: adminInfo.userAgent || "Unknown",
    });

    logger.warn(
      {
        adminId: adminInfo.adminId,
        action: "User deleted",
        deletedUser: user.email,
      },
      "Admin deleted user"
    );

    return { message: "User deleted successfully" };
  }

  // Get system stats
  static async getStats() {
    const [
      totalUsers,
      totalAdmins,
      totalDevelopers,
      totalModerators,
      totalClients,
      activeUsers,
      inactiveUsers,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "DEVELOPER" } }),
      prisma.user.count({ where: { role: "MODERATOR" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "INACTIVE" } }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
              profilePicture: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        byRole: {
          admins: totalAdmins,
          developers: totalDevelopers,
          moderators: totalModerators,
          clients: totalClients,
        },
        byStatus: {
          active: activeUsers,
          inactive: inactiveUsers,
        },
      },
      recentActivities,
    };
  }

  // Get activity logs
  static async getActivityLogs(filters: {
    page?: number;
    limit?: number;
    userId?: string;
    activity?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, userId, activity, search } = filters;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (activity && activity !== "all") {
      where.activity = {
        contains: activity,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { activity: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

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
}
