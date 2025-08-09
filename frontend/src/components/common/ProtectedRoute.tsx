import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { Loader2 } from "lucide-react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute Component
 * Provides role-based access control for routes
 *
 * Features:
 * - Authentication verification
 * - Role-based access control
 * - Email verification requirements
 * - Account status checking
 * - Automatic redirects for unauthorized access
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireEmailVerification = false,
  requireAdmin = false,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification requirement
  if (requireEmailVerification && !user?.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check account status
  if (user?.status !== "ACTIVE") {
    const status = user?.status?.toLowerCase() || "inactive";
    return (
      <Navigate
        to={`/account-status?status=${status}&email=${encodeURIComponent(
          user?.email || ""
        )}`}
        replace
      />
    );
  }

  // All checks passed - render protected content
  return <>{children}</>;
};
