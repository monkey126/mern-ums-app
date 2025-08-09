import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle, User } from "lucide-react";
import React from "react";

/**
 * Debug page for development and troubleshooting
 * Displays authentication state, user information, and access control analysis
 * Provides debug actions for clearing storage and logging state
 */
export const DebugPage: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Logo size="sm" />
            Authentication Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Authentication Status:</span>
            {isAuthenticated ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Authenticated
              </Badge>
            )}
          </div>

          {user ? (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {user.id}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {user.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <Badge variant="outline" className="ml-2">
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      user.status === "ACTIVE" ? "default" : "destructive"
                    }
                    className="ml-2"
                  >
                    {user.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Email Verified:</span>
                  <Badge
                    variant={user.emailVerified ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              No user information available
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Access Control Analysis</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Dashboard Access:</span>
                <Badge
                  variant={isAuthenticated ? "default" : "destructive"}
                  className="ml-2"
                >
                  {isAuthenticated ? "Allowed" : "Denied"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Admin Access:</span>
                <Badge
                  variant={user?.role === "ADMIN" ? "default" : "destructive"}
                  className="ml-2"
                >
                  {user?.role === "ADMIN" ? "Allowed" : "Denied"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Account Status:</span>
                <Badge
                  variant={
                    user?.status === "ACTIVE" ? "default" : "destructive"
                  }
                  className="ml-2"
                >
                  {user?.status === "ACTIVE" ? "Active" : "Inactive/Suspended"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Debug Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log("Current auth state:", {
                    user,
                    isLoading,
                    isAuthenticated,
                  });
                  console.log("Local storage:", {
                    accessToken: localStorage.getItem("accessToken"),
                    refreshToken: localStorage.getItem("refreshToken"),
                    user: localStorage.getItem("user"),
                  });
                }}
              >
                Log Auth State
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Storage & Reload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
