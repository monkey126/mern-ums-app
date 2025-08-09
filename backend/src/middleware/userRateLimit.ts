import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: AuthenticatedRequest) => string;
  onLimitReached?: (req: AuthenticatedRequest) => void;
  message?: string;
}

/**
 * In-memory store for rate limiting data
 * TODO: Replace with Redis for production scaling and distributed systems
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup expired rate limit entries every 5 minutes
 * Prevents memory leaks and maintains performance
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Default key generator - uses user ID
 */
const defaultKeyGenerator = (req: AuthenticatedRequest): string => {
  return req.user?.id || req.ip || "anonymous";
};

/**
 * Default rate limit options
 */
const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: defaultKeyGenerator,
  onLimitReached: (req: AuthenticatedRequest) => {
    logger.warn(
      {
        userId: req.user?.id,
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      "Rate limit exceeded for user"
    );
  },
  message: "Too many requests from this user, please try again later.",
};

/**
 * Create a rate limiter for authenticated users
 */
export function createUserRateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    // Skip rate limiting for unauthenticated requests (handled by global rate limiter)
    if (!authReq.user) {
      return next();
    }

    const key = opts.keyGenerator(authReq);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + opts.windowMs,
        lastRequest: now,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;
    entry.lastRequest = now;

    // Check if limit exceeded
    if (entry.count > opts.maxRequests) {
      opts.onLimitReached(authReq);

      res.status(429).json({
        success: false,
        message: opts.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        limit: opts.maxRequests,
        remaining: 0,
        resetTime: new Date(entry.resetTime).toISOString(),
      });
      return;
    }

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", opts.maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, opts.maxRequests - entry.count)
    );
    res.setHeader("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());

    // Log rate limit info for monitoring
    if (entry.count > opts.maxRequests * 0.8) {
      // Warn at 80% of limit
      logger.warn(
        {
          userId: authReq.user.id,
          requestCount: entry.count,
          limit: opts.maxRequests,
          remaining: opts.maxRequests - entry.count,
          path: req.path,
        },
        "User approaching rate limit"
      );
    }

    next();
  };
}

/**
 * Predefined rate limiters for different endpoints
 */

// General API rate limiter for authenticated users
export const generalUserRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requests per 15 minutes
  message: "Too many API requests. Please slow down.",
});

// Strict rate limiter for sensitive operations
export const sensitiveOperationsRateLimit = createUserRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 requests per hour
  message: "Too many sensitive operations. Please try again later.",
});

// Auth-specific rate limiter
export const authRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 auth requests per 15 minutes
  message: "Too many authentication attempts. Please try again later.",
  keyGenerator: (req: AuthenticatedRequest) => {
    // For auth endpoints, use IP + user email if available
    const email = req.body?.email || req.user?.email;
    return email ? `auth:${email}` : `auth:${req.ip}`;
  },
});

// Admin operations rate limiter
export const adminRateLimit = createUserRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 200, // 200 admin requests per 5 minutes
  message: "Too many admin operations. Please slow down.",
});

// File upload rate limiter
export const uploadRateLimit = createUserRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 uploads per hour
  message: "Too many file uploads. Please try again later.",
});

/**
 * Get rate limit status for a user
 */
export function getRateLimitStatus(userId: string): {
  count: number;
  remaining: number;
  resetTime: Date;
} | null {
  const entry = rateLimitStore.get(userId);
  if (!entry) {
    return null;
  }

  return {
    count: entry.count,
    remaining: Math.max(0, defaultOptions.maxRequests - entry.count),
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetUserRateLimit(userId: string): boolean {
  return rateLimitStore.delete(userId);
}

/**
 * Get all active rate limit entries (admin function)
 */
export function getAllRateLimitEntries(): Array<{
  key: string;
  count: number;
  resetTime: Date;
  lastRequest: Date;
}> {
  const entries: Array<{
    key: string;
    count: number;
    resetTime: Date;
    lastRequest: Date;
  }> = [];

  for (const [key, entry] of rateLimitStore.entries()) {
    entries.push({
      key,
      count: entry.count,
      resetTime: new Date(entry.resetTime),
      lastRequest: new Date(entry.lastRequest),
    });
  }

  return entries;
}
