import { Router } from "express";
import asyncHandler from "express-async-handler";
import { AuthController } from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  forgotPasswordSchema,
  loginSchema,
  passwordResetSchema,
  refreshTokenSchema,
  registerSchema,
  resendVerificationSchema,
} from "../schemas/validation";

/**
 * Authentication Routes
 * Handles user registration, login, email verification, and password reset
 * Includes both public and protected endpoints
 */
const router = Router();

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get("/verify-email/:token", asyncHandler(AuthController.verifyEmail));

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  asyncHandler(AuthController.resendVerificationEmail)
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post(
  "/reset-password/:token",
  validate(passwordResetSchema),
  asyncHandler(AuthController.resetPassword)
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, asyncHandler(AuthController.getCurrentUser));

// @desc    Get CSRF token
// @route   GET /api/auth/csrf-token
// @access  Private
router.get("/csrf-token", protect, asyncHandler(AuthController.getCSRFToken));

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  asyncHandler(AuthController.refreshToken)
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, asyncHandler(AuthController.logout));

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
router.post("/logout-all", protect, asyncHandler(AuthController.logoutAll));

export default router;
