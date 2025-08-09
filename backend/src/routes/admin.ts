import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { AdminController } from '../controllers/adminController';
import { admin, canViewActivityLogs, protect } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';

// Validation schemas
const userUpdateSchema = z.object({
	name: z.string().min(2).max(50).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	role: z.enum(['ADMIN', 'CLIENT', 'DEVELOPER', 'MODERATOR']).optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

const userQuerySchema = z.object({
	page: z.string().regex(/^\d+$/).transform(Number).default('1'),
	limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
	role: z.enum(['ADMIN', 'CLIENT', 'DEVELOPER', 'MODERATOR']).optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
	search: z.string().optional(),
	sortBy: z
		.enum(['name', 'email', 'role', 'status', 'createdAt'])
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const activityLogsQuerySchema = z.object({
	page: z.string().regex(/^\d+$/).transform(Number).default('1'),
	limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
	userId: z.string().optional(),
	activity: z.string().optional(),
	search: z.string().optional(),
});

const router = Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all users (with filtering and pagination)
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get(
	'/users',
	admin,
	validateQuery(userQuerySchema),
	asyncHandler(AdminController.getUsers)
);

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
router.get('/users/:id', admin, asyncHandler(AdminController.getUserById));

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
router.put(
	'/users/:id',
	admin,
	validate(userUpdateSchema),
	asyncHandler(AdminController.updateUser)
);

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', admin, asyncHandler(AdminController.deleteUser));

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', admin, asyncHandler(AdminController.getStats));

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin, Developer, Moderator)
router.get(
	'/activity-logs',
	canViewActivityLogs,
	validateQuery(activityLogsQuerySchema),
	asyncHandler(AdminController.getActivityLogs)
);

export default router;
