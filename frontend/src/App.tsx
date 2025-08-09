import { Layout } from "@/components/common/Layout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Auth Pages
import { EmailVerificationPage } from "@/pages/auth/EmailVerificationPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

// Main Pages
import { AccountStatusPage } from "@/pages/AccountStatusPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DebugPage } from "@/pages/DebugPage";
import MyActivityPage from "@/pages/MyActivityPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

// Admin Pages
import {
  ActivityLogsPage,
  AdminDashboardPage,
  UserManagementPage,
} from "@/pages/admin";

// Developer and Moderator Pages
import { DeveloperProjects } from "@/pages/developer/DeveloperProjects";
import { ModeratorFeedback } from "@/pages/moderator/ModeratorFeedback";
import SettingsPage from "@/pages/SettingsPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/account-status" element={<AccountStatusPage />} />

              {/* Protected Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-activity"
                  element={
                    <ProtectedRoute
                      allowedRoles={["ADMIN", "DEVELOPER", "MODERATOR"]}
                    >
                      <MyActivityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="debug"
                  element={
                    <ProtectedRoute>
                      <DebugPage />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/activity-logs"
                  element={
                    <ProtectedRoute
                      allowedRoles={["ADMIN", "DEVELOPER", "MODERATOR"]}
                    >
                      <ActivityLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Developer Routes */}
                <Route
                  path="developer"
                  element={
                    <ProtectedRoute allowedRoles={["DEVELOPER"]}>
                      <DeveloperProjects />
                    </ProtectedRoute>
                  }
                />

                {/* Moderator Routes */}
                <Route
                  path="moderator"
                  element={
                    <ProtectedRoute allowedRoles={["MODERATOR"]}>
                      <ModeratorFeedback />
                    </ProtectedRoute>
                  }
                />

                {/* Add more protected routes here */}
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all route for undefined paths */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
