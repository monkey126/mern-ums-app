import { api } from "@/lib/api";
import type {
  ActivityLogsResponse,
  ApiResponse,
  ChangePasswordData,
  ProfileUpdateData,
  User,
} from "@/types";

/**
 * User Service
 * Handles user profile management and activity operations
 * All methods require authentication
 */
export const userService = {
  /**
   * Get current user profile
   * Returns complete user information
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/users/profile");
    return response.data.data!;
  },

  /**
   * Update user profile information
   * Updates name, phone, and other profile data
   */
  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await api.put<ApiResponse<User>>("/users/profile", data);
    return response.data.data!;
  },

  /**
   * Change user password
   * Requires current password for security
   */
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.put("/users/change-password", data);
  },

  /**
   * Upload profile picture
   * Accepts base64 encoded image data
   */
  uploadProfilePicture: async (profilePicture: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      "/users/profile-picture",
      { profilePicture }
    );
    return response.data.data!;
  },

  /**
   * Get user's activity logs
   * Returns paginated activity history for the current user
   */
  getMyActivity: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      activity?: string;
    } = {}
  ): Promise<ActivityLogsResponse> => {
    const response = await api.get<ApiResponse<ActivityLogsResponse>>(
      "/activity",
      { params }
    );
    return response.data.data!;
  },
};
