import {
  generateCSRFTokenForUser,
  clearCSRFTokenForUser,
  getCSRFTokenForUser,
} from "../middleware/csrf";
import {
  getRateLimitStatus,
  resetUserRateLimit,
  getAllRateLimitEntries,
} from "../middleware/userRateLimit";
import { ActivityLogModel } from "../models";
import { prisma } from "../lib/prisma";
import logger from "../utils/logger";
import { RequestInfo } from "../utils/requestHelper";

/**
 * Security Service
 * Provides utilities for managing security features including:
 * - CSRF token management
 * - Rate limiting administration
 * - Security auditing and monitoring
 * - Attack pattern detection
 */
export class SecurityService {
  /**
   * Generate CSRF token for user
   */
  static async generateCSRFToken(
    userId: string,
    requestInfo: RequestInfo
  ): Promise<string> {
    try {
      const token = generateCSRFTokenForUser(userId);

      // Log CSRF token generation
      await ActivityLogModel.create({
        user: { connect: { id: userId } },
        activity: "CSRF token generated",
        details: JSON.stringify({ action: "csrf_token_generated" }),
        ipAddress: requestInfo.ip || null,
        userAgent: requestInfo.userAgent || "Unknown",
      });

      logger.info({ userId }, "CSRF token generated for user");
      return token;
    } catch (error) {
      logger.error({ userId, error }, "Failed to generate CSRF token");
      throw new Error("Failed to generate CSRF token");
    }
  }

  /**
   * Clear CSRF token for user (on logout)
   */
  static async clearCSRFToken(
    userId: string,
    requestInfo: RequestInfo
  ): Promise<void> {
    try {
      clearCSRFTokenForUser(userId);

      // Log CSRF token clearing
      await ActivityLogModel.create({
        user: { connect: { id: userId } },
        activity: "CSRF token cleared",
        details: JSON.stringify({ action: "csrf_token_cleared" }),
        ipAddress: requestInfo.ip || null,
        userAgent: requestInfo.userAgent || "Unknown",
      });

      logger.info({ userId }, "CSRF token cleared for user");
    } catch (error) {
      logger.error({ userId, error }, "Failed to clear CSRF token");
      throw new Error("Failed to clear CSRF token");
    }
  }

  /**
   * Get user's rate limit status
   */
  static getUserRateLimitStatus(userId: string): {
    count: number;
    remaining: number;
    resetTime: Date;
  } | null {
    return getRateLimitStatus(userId);
  }

  /**
   * Reset rate limit for user (admin function)
   */
  static async resetUserRateLimit(
    userId: string,
    adminId: string,
    requestInfo: RequestInfo
  ): Promise<boolean> {
    try {
      const result = resetUserRateLimit(userId);

      if (result) {
        // Log rate limit reset
        await ActivityLogModel.create({
          user: { connect: { id: adminId } },
          activity: "Rate limit reset",
          details: JSON.stringify({
            action: "rate_limit_reset",
            targetUserId: userId,
          }),
          ipAddress: requestInfo.ip || null,
          userAgent: requestInfo.userAgent || "Unknown",
        });

        logger.info({ userId, adminId }, "Rate limit reset for user");
      }

      return result;
    } catch (error) {
      logger.error({ userId, adminId, error }, "Failed to reset rate limit");
      throw new Error("Failed to reset rate limit");
    }
  }

  /**
   * Get all rate limit entries (admin function)
   */
  static getAllRateLimitEntries(): Array<{
    key: string;
    count: number;
    resetTime: Date;
    lastRequest: Date;
  }> {
    return getAllRateLimitEntries();
  }

  /**
   * Security audit - check for suspicious activity
   */
  static async performSecurityAudit(userId: string): Promise<{
    rateLimitStatus: any;
    hasCSRFToken: boolean;
    recentActivity: any[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
  }> {
    try {
      // Get rate limit status
      const rateLimitStatus = this.getUserRateLimitStatus(userId);

      // Check if user has CSRF token
      const hasCSRFToken = getCSRFTokenForUser(userId) !== null;

      // Get recent activity (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentActivity = await prisma.activityLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

      // Calculate risk level
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

      if (rateLimitStatus && rateLimitStatus.count > 800) {
        riskLevel = "HIGH";
      } else if (rateLimitStatus && rateLimitStatus.count > 500) {
        riskLevel = "MEDIUM";
      } else if (recentActivity.length > 100) {
        riskLevel = "MEDIUM";
      }

      return {
        rateLimitStatus,
        hasCSRFToken,
        recentActivity,
        riskLevel,
      };
    } catch (error) {
      logger.error({ userId, error }, "Failed to perform security audit");
      throw new Error("Failed to perform security audit");
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    userId: string,
    event: string,
    details: any,
    requestInfo: RequestInfo,
    severity: "INFO" | "WARN" | "ERROR" = "INFO"
  ): Promise<void> {
    try {
      await ActivityLogModel.create({
        user: { connect: { id: userId } },
        activity: `Security Event: ${event}`,
        details: JSON.stringify({
          event,
          severity,
          ...details,
        }),
        ipAddress: requestInfo.ip || null,
        userAgent: requestInfo.userAgent || "Unknown",
      });

      const logMethod =
        severity === "ERROR" ? "error" : severity === "WARN" ? "warn" : "info";

      logger[logMethod](
        { userId, event, severity, details },
        "Security event logged"
      );
    } catch (error) {
      logger.error({ userId, event, error }, "Failed to log security event");
    }
  }

  /**
   * Check if user is under attack (multiple failed attempts)
   */
  static async checkForAttack(userId: string): Promise<{
    isUnderAttack: boolean;
    failedAttempts: number;
    lastAttempt: Date | null;
  }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const failedAttempts = await prisma.activityLog.count({
        where: {
          userId,
          activity: {
            contains: "failed",
          },
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      const lastFailedAttempt = await prisma.activityLog.findFirst({
        where: {
          userId,
          activity: {
            contains: "failed",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const isUnderAttack = failedAttempts > 10; // More than 10 failed attempts in 1 hour

      return {
        isUnderAttack,
        failedAttempts,
        lastAttempt: lastFailedAttempt?.createdAt || null,
      };
    } catch (error) {
      logger.error({ userId, error }, "Failed to check for attack");
      return {
        isUnderAttack: false,
        failedAttempts: 0,
        lastAttempt: null,
      };
    }
  }
}
