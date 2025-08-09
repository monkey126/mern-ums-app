import { Router } from "express";
import { protect } from "../middleware/auth";
import asyncHandler from "express-async-handler";
import { ActivityController } from "../controllers/activityController";

const router = Router();

// @desc    Get user activities
// @route   GET /api/activity
// @access  Private
router.get("/", protect, asyncHandler(ActivityController.getUserActivities));

// @desc    Get activity by ID
// @route   GET /api/activity/:id
// @access  Private
router.get("/:id", protect, asyncHandler(ActivityController.getActivityById));

export default router;
