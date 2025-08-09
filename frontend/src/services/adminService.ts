import { api } from "@/lib/api";
import type {
  ActivityLogsResponse,
  ApiResponse,
  DashboardStats,
  User,
  UserQueryParams,
  UserRole,
  UserStatus,
  UsersResponse,
} from "@/types";

/**
 * Admin Service
 * Handles administrative operations including:
 * - User management (CRUD operations)
 * - Dashboard statistics
 * - Activity log monitoring
 * - System administration
 *
 * All methods require ADMIN role
 */
export const adminService = {
  /**
   * Get all users with filtering and pagination
   * Supports filtering by role, status, and search terms
   */
  getUsers: async (params: UserQueryParams = {}): Promise<UsersResponse> => {
    const response = await api.get<ApiResponse<UsersResponse>>("/admin/users", {
      params,
    });
    return response.data.data!;
  },

  /**
   * Get single user by ID
   * Returns complete user information for admin view
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data.data!;
  },

  /**
   * Update user information
   * Allows admin to modify user profile data
   */
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(
      `/admin/users/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete user account
   * Permanently removes user from system
   */
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  /**
   * Change user role
   * Updates user permissions and access level
   */
  changeUserRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, {
      role,
    });
    return response.data.data!;
  },

  /**
   * Change user status
   * Activate, deactivate, or suspend user accounts
   */
  changeUserStatus: async (id: string, status: UserStatus): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, {
      status,
    });
    return response.data.data!;
  },

  /**
   * Get dashboard statistics
   * Returns user counts, activity metrics, and system overview
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>("/admin/stats");
    return response.data.data!;
  },

  /**
   * Get system activity logs
   * Returns paginated activity logs for monitoring and auditing
   */
  getActivityLogs: async (
    params: {
      page?: number;
      limit?: number;
      activity?: string;
      search?: string;
    } = {}
  ): Promise<ActivityLogsResponse> => {
    const response = await api.get<ApiResponse<ActivityLogsResponse>>(
      "/admin/activity-logs",
      { params }
    );
    return response.data.data!;
  },
};
