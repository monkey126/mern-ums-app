// User types matching backend
export type UserRole = "ADMIN" | "CLIENT" | "DEVELOPER" | "MODERATOR";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activity: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
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

// Activity logs specific response type
export interface ActivityLogsResponse {
  activities: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Users response type
export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  csrfToken?: string;
}

// Profile types
export interface ProfileUpdateData {
  name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Admin types
export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Updated to match backend response structure
export interface DashboardStats {
  stats: {
    totalUsers: number;
    byRole: {
      admins: number;
      developers: number;
      moderators: number;
      clients: number;
    };
    byStatus: {
      active: number;
      inactive: number;
    };
  };
  recentActivities: ActivityLog[];
}

// Form validation error type
export interface ValidationErrors {
  [key: string]: string[];
}
