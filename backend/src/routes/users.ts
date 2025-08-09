import { Router } from "express";
import { validate } from "../middleware/validation";
import {
  profileUpdateSchema,
  changePasswordSchema,
  profilePictureUploadSchema,
} from "../schemas/validation";
import { protect } from "../middleware/auth";
import asyncHandler from "express-async-handler";
import { UserController } from "../controllers/userController";
import {
  sensitiveOperationsRateLimit,
  uploadRateLimit,
} from "../middleware/userRateLimit";

/**
 * User Routes
 * Handles user profile management, password changes, and file uploads
 * All routes require authentication
 */
const router = Router();

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get("/profile", protect, asyncHandler(UserController.getProfile));

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put(
  "/profile",
  protect,
  validate(profileUpdateSchema),
  asyncHandler(UserController.updateProfile)
);

/**
 * @desc    Change password (rate limited for security)
 * @route   PUT /api/users/change-password
 * @access  Private
 */
router.put(
  "/change-password",
  protect,
  sensitiveOperationsRateLimit,
  validate(changePasswordSchema),
  asyncHandler(UserController.changePassword)
);

/**
 * @desc    Upload profile picture (rate limited)
 * @route   POST /api/users/profile-picture
 * @access  Private
 */
router.post(
  "/profile-picture",
  protect,
  uploadRateLimit,
  validate(profilePictureUploadSchema),
  asyncHandler(UserController.uploadProfilePicture)
);

export default router;
