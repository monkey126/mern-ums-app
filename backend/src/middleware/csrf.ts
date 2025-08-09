import { Request, Response, NextFunction } from "express";
import { randomBytes, createHash } from "crypto";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

/**
 * In-memory store for CSRF tokens
 * TODO: Replace with Redis or database for production scaling
 */
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Cleanup expired CSRF tokens every 30 minutes
 * Prevents memory leaks in long-running applications
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokenStore.entries()) {
    if (value.expires < now) {
      csrfTokenStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

export interface CSRFOptions {
  headerName?: string;
  cookieName?: string;
  tokenLength?: number;
  maxAge?: number;
  ignoreMethods?: string[];
  skipRoutes?: string[];
}

const defaultOptions: Required<CSRFOptions> = {
  headerName: "x-csrf-token",
  cookieName: "csrf-token",
  tokenLength: 32,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  skipRoutes: ["/api/auth/login", "/api/auth/register", "/health"],
};

/**
 * Generate a CSRF token
 */
function generateCSRFToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Create a hash of the token for storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate and store CSRF token for a user session
 */
export function generateCSRFTokenForUser(
  userId: string,
  options = defaultOptions
): string {
  const token = generateCSRFToken(options.tokenLength);
  const hashedToken = hashToken(token);

  csrfTokenStore.set(userId, {
    token: hashedToken,
    expires: Date.now() + options.maxAge,
  });

  logger.info({ userId }, "CSRF token generated for user");
  return token;
}

/**
 * Validate CSRF token for a user
 */
function validateCSRFToken(userId: string, providedToken: string): boolean {
  const stored = csrfTokenStore.get(userId);
  if (!stored) {
    return false;
  }

  if (stored.expires < Date.now()) {
    csrfTokenStore.delete(userId);
    return false;
  }

  const hashedProvidedToken = hashToken(providedToken);
  return stored.token === hashedProvidedToken;
}

/**
 * CSRF Protection Middleware
 */
export function csrfProtection(options: CSRFOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF protection for certain methods
    if (opts.ignoreMethods.includes(req.method)) {
      return next();
    }

    // Skip CSRF protection for certain routes
    if (opts.skipRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    // For authenticated requests, validate CSRF token
    const authReq = req as AuthenticatedRequest;
    if (authReq.user) {
      const providedToken =
        (req.headers[opts.headerName] as string) ||
        req.body["_csrf"] ||
        (req.query["_csrf"] as string);

      if (!providedToken) {
        logger.warn(
          {
            userId: authReq.user.id,
            path: req.path,
            method: req.method,
          },
          "CSRF token missing"
        );
        res.status(403).json({
          success: false,
          message: "CSRF token missing",
          code: "CSRF_TOKEN_MISSING",
        });
        return;
      }

      if (!validateCSRFToken(authReq.user.id, providedToken)) {
        logger.warn(
          {
            userId: authReq.user.id,
            path: req.path,
            method: req.method,
          },
          "Invalid CSRF token"
        );
        res.status(403).json({
          success: false,
          message: "Invalid CSRF token",
          code: "CSRF_TOKEN_INVALID",
        });
        return;
      }

      logger.debug(
        { userId: authReq.user.id },
        "CSRF token validated successfully"
      );
    }

    next();
  };
}

/**
 * Middleware to provide CSRF token to authenticated users
 */
export function provideCSRFToken(options: CSRFOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (req.user) {
      // Generate new token for the user
      const token = generateCSRFTokenForUser(req.user.id, opts);

      // Add token to response headers
      res.setHeader("X-CSRF-Token", token);

      // Optionally set as cookie (for form-based requests)
      res.cookie(opts.cookieName, token, {
        httpOnly: false, // Allow JavaScript access for AJAX requests
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "strict",
        maxAge: opts.maxAge,
      });

      // Add to response locals for template rendering
      res.locals["csrfToken"] = token;
    }

    next();
  };
}

/**
 * Get CSRF token for a user (utility function)
 */
export function getCSRFTokenForUser(userId: string): string | null {
  const stored = csrfTokenStore.get(userId);
  if (!stored || stored.expires < Date.now()) {
    return null;
  }
  return stored.token;
}

/**
 * Clear CSRF token for a user (e.g., on logout)
 */
export function clearCSRFTokenForUser(userId: string): void {
  csrfTokenStore.delete(userId);
  logger.info({ userId }, "CSRF token cleared for user");
}
