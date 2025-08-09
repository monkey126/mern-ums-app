import React, { useEffect, useState } from "react";
import type { User, RegisterData } from "@/types";
import { authService } from "@/services/authService";
import { setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/contexts/auth";

/**
 * AuthProvider component that manages authentication state and provides
 * authentication methods to the entire application through React Context.
 *
 * Features:
 * - Automatic token validation on app initialization
 * - CSRF token management
 * - Account status handling (inactive/suspended accounts)
 * - Persistent user session management
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!getAccessToken();

  /**
   * Initialize authentication state on app startup
   * Validates existing tokens and fetches user data if available
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();

        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (userError: unknown) {
            // Type guard to safely access error properties
            const isAxiosError = (
              error: unknown
            ): error is { response?: { data?: { message?: string } } } => {
              return (
                typeof error === "object" &&
                error !== null &&
                "response" in error
              );
            };

            const errorMessage = isAxiosError(userError)
              ? userError.response?.data?.message || ""
              : "";

            // Handle account status errors differently - keep tokens for status page
            if (
              errorMessage.includes("inactive") ||
              errorMessage.includes("suspended")
            ) {
              setUser(null);
            } else {
              // For authentication errors, clear tokens and reset state
              clearTokens();
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch {
        // Fallback error handling for unexpected errors
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Authenticate user with email and password
   * Sets tokens, user data, and shows success message on successful login
   * Handles account status errors without setting tokens
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      // Store authentication tokens and user data
      setTokens(
        response.accessToken,
        response.refreshToken,
        response.csrfToken
      );
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Login successful!");
    } catch (error: unknown) {
      // Type guard for error handling
      const isAxiosError = (
        err: unknown
      ): err is { response?: { data?: { message?: string } } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || ""
        : "";

      // Don't set tokens for account status issues - let login page handle redirect
      if (
        errorMessage.includes("inactive") ||
        errorMessage.includes("suspended")
      ) {
        // Account status errors are handled by the login page
      }

      throw error;
    }
  };

  /**
   * Register a new user account
   * Does not automatically log in - requires email verification first
   * Returns email for verification flow
   */
  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      return { email: data.email };
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Registration failed. Please try again.");
      } else {
        toast.error("An unknown error occurred.");
      }
      throw error; // still rethrow for upper-level handling
    }
  };

  /**
   * Log out the current user
   * Clears tokens and user data locally even if server call fails
   * This ensures user is logged out on the client side regardless
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      clearTokens();
      toast.success("Logged out successfully");
    }
  };

  /**
   * Update user data in state and localStorage
   * Used when user profile is updated
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
