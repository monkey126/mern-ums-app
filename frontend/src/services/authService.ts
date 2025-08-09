import { api, setCSRFToken } from "@/lib/api";
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types";

/**
 * Authentication Service
 * Handles all authentication-related API calls including:
 * - User registration and login
 * - Email verification and password reset
 * - Token refresh and logout
 * - CSRF token management
 */
export const authService = {
  /**
   * Register a new user account
   * Sends user data to backend for account creation
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data!;
  },

  /**
   * Authenticate user with email and password
   * Returns access token, refresh token, and CSRF token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );

    // Store CSRF token for subsequent requests
    const authData = response.data.data!;
    if (authData.csrfToken) {
      setCSRFToken(authData.csrfToken);
    }

    return authData;
  },

  /**
   * Get current authenticated user profile
   * Requires valid access token
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data.data!;
  },

  /**
   * Verify user email address using verification token
   * Activates the user account
   */
  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`/auth/verify-email/${token}`);
  },

  /**
   * Resend email verification link
   * For users who didn't receive the initial verification email
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post("/auth/resend-verification", { email });
  },

  /**
   * Initiate password reset process
   * Sends password reset email to user
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  /**
   * Reset user password using reset token
   * Completes the password reset process
   */
  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    await api.post(`/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
  },

  /**
   * Refresh expired access token
   * Returns new access token, refresh token, and CSRF token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/refresh-token",
      { refreshToken }
    );
    return response.data.data!;
  },

  /**
   * Logout current user from current device
   * Invalidates refresh token on server
   */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  /**
   * Logout user from all devices
   * Invalidates all refresh tokens
   */
  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout-all");
  },

  /**
   * Get CSRF token manually
   * Used when CSRF token is needed for specific operations
   */
  getCSRFToken: async (): Promise<{ csrfToken: string }> => {
    const response = await api.get<ApiResponse<{ csrfToken: string }>>(
      "/auth/csrf-token"
    );
    const data = response.data.data!;

    // Store the token for future requests
    setCSRFToken(data.csrfToken);

    return data;
  },
};
