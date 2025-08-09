import { User, UserRole, ActivityLog } from "@prisma/client";
import { Request } from "express";

// Extended User type with relations
export interface UserWithRelations extends User {
  activityLogs?: ActivityLog[];
}

// JWT payload type
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: {
    ADMIN: number;
    CLIENT: number;
    DEVELOPER: number;
    MODERATOR: number;
  };
  recentActivity: ActivityLog[];
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
