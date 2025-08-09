import { Request, Response } from "express";
import { AuthService, UserService } from "../services";
import { AuthenticatedRequest } from "../types";
import { handleControllerError } from "../utils/handleControllerError";
import { getRequestInfo } from "../utils/requestHelper";
import {
  generateCSRFTokenForUser,
  clearCSRFTokenForUser,
} from "../middleware/csrf";

/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests including:
 * - User registration and login
 * - Email verification and password reset
 * - Token refresh and logout
 * - CSRF token management
 */
export class AuthController {
  /**
   * Register a new user account
   * Validates input, creates user, sends verification email
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, confirmPassword, phone } = req.body;

      const result = await AuthService.register(
        { name, email, password, confirmPassword, phone },
        getRequestInfo(req)
      );

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Authenticate user with email and password
   * Returns access token, refresh token, and CSRF token on success
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(
        { email, password },
        getRequestInfo(req)
      );

      // Generate CSRF token for the authenticated session
      const csrfToken = generateCSRFTokenForUser(result.user?.id!);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          ...result,
          csrfToken,
        },
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  /**
   * Verify user email address using verification token
   * Activates the user account and sends welcome email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const result = await AuthService.verifyEmail(
        token || "",
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Resend email verification link
   * Generates new verification token and sends email
   */
  static async resendVerificationEmail(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;

      const result = await AuthService.resendVerificationEmail(
        email,
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Initiate password reset process
   * Generates reset token and sends password reset email
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(
        email,
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reset user password using reset token
   * Validates token and updates password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      const result = await AuthService.resetPassword(
        token || "",
        password,
        confirmPassword,
        getRequestInfo(req)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get current user
  static async getCurrentUser(
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
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get CSRF token for authenticated user
  static async getCSRFToken(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const csrfToken = generateCSRFTokenForUser(req.user?.id!);

      res.json({
        success: true,
        data: {
          csrfToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to generate CSRF token",
      });
    }
  }

  /**
   * Refresh expired access token using refresh token
   * Returns new access token, refresh token, and CSRF token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshToken(
        { refreshToken },
        getRequestInfo(req)
      );

      // Generate new CSRF token for security (token rotation)
      const csrfToken = generateCSRFTokenForUser(result.user.id);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          ...result,
          csrfToken,
        },
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  /**
   * Logout current user
   * Invalidates refresh token and clears CSRF token
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.logout(
        req.user?.id!,
        getRequestInfo(req)
      );

      // Clear CSRF token for the user
      clearCSRFTokenForUser(req.user?.id!);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }

  /**
   * Logout user from all devices
   * Invalidates all refresh tokens and clears CSRF token
   */
  static async logoutAll(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const result = await AuthService.logoutAll(
        req.user?.id!,
        getRequestInfo(req)
      );

      // Clear CSRF token for the user
      clearCSRFTokenForUser(req.user?.id!);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      handleControllerError(error, res);
    }
  }
}
