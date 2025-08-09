import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * User Model
 * Data access layer for user operations
 * Provides methods for user CRUD operations and authentication
 */
export class UserModel {
  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email (excludes password)
   */
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by email including password (for authentication)
   */
  static async findByEmailWithPassword(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        role: true,
        name: true,
        emailVerified: true,
      },
    });
  }

  /**
   * Create new user
   */
  static async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
    });
  }

  /**
   * Update user data
   */
  static async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Find user by email verification token
   */
  static async findByVerificationToken(token: string) {
    return await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });
  }

  /**
   * Find user by password reset token
   */
  static async findByResetToken(token: string) {
    return await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Get user profile (excludes sensitive data like password)
   */
  static async getProfile(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profilePicture: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by refresh token (for token refresh)
   */
  static async findByRefreshToken(refreshToken: string) {
    return await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpires: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Clear refresh token (for logout)
   */
  static async clearRefreshToken(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        refreshToken: null,
        refreshTokenExpires: null,
      },
    });
  }
}
