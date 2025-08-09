import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

// Environment variables are loaded correctly

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Token management utilities
 * Handles storage and retrieval of authentication tokens
 */
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");
const getCSRFToken = () => localStorage.getItem("csrfToken");

const setTokens = (
  accessToken: string,
  refreshToken: string,
  csrfToken?: string
) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  if (csrfToken) {
    localStorage.setItem("csrfToken", csrfToken);
  }
};

const setCSRFToken = (csrfToken: string) => {
  localStorage.setItem("csrfToken", csrfToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("csrfToken");
  localStorage.removeItem("user");
};

/**
 * Request interceptor to add authentication and CSRF tokens
 * - Adds Bearer token for authentication
 * - Adds CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
 */
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const csrfToken = getCSRFToken();
    if (
      csrfToken &&
      ["post", "put", "patch", "delete"].includes(
        config.method?.toLowerCase() || ""
      )
    ) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for automatic token refresh and CSRF token handling
 * - Extracts and stores CSRF tokens from response headers
 * - Automatically refreshes expired access tokens
 * - Handles authentication errors and redirects
 */
api.interceptors.response.use(
  (response) => {
    // Extract and store CSRF token from response headers
    const csrfToken = response.headers["x-csrf-token"];
    if (csrfToken) {
      setCSRFToken(csrfToken);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Determine error type to handle appropriately
    const errorData = error.response?.data as { message?: string } | undefined;
    const errorMessage = errorData?.message || "";
    const isAccountStatusError =
      errorMessage.includes("inactive") || errorMessage.includes("suspended");

    const isLoginError =
      originalRequest.url?.includes("/auth/login") ||
      errorMessage.toLowerCase().includes("invalid credentials") ||
      errorMessage.toLowerCase().includes("no account found") ||
      errorMessage.toLowerCase().includes("incorrect password") ||
      errorMessage.toLowerCase().includes("email not verified");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAccountStatusError &&
      !isLoginError
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          }/auth/refresh-token`,
          { refreshToken }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          csrfToken,
        } = response.data.data;
        setTokens(accessToken, newRefreshToken, csrfToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - redirect to login unless it's a login error
        if (!isLoginError) {
          clearTokens();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Extract error message and show toast notification
    const message =
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data
        ? (error.response.data as { message: string }).message
        : error.message;

    // Show error toast except for account status and login errors (handled by UI)
    if (message && !isAccountStatusError && !isLoginError) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getCSRFToken,
  setTokens,
  setCSRFToken,
};
