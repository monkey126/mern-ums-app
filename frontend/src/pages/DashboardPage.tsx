import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import React from "react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Full system access and user control";
      case "DEVELOPER":
        return "Internal users with project access";
      case "MODERATOR":
        return "Manage client comments and feedback";
      default:
        return "Can register, login, and update profile";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "DEVELOPER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "MODERATOR":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your account overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
                {user.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Updated {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Logo size="sm" />
              Role & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">{user.role}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {getRoleDescription(user.role)}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Permissions:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View dashboard</li>
                <li>• Edit own profile</li>
                {(user.role === "ADMIN" ||
                  user.role === "DEVELOPER" ||
                  user.role === "MODERATOR") && <li>• View activity logs</li>}
                {user.role === "MODERATOR" && (
                  <li>• View moderator dashboard</li>
                )}
                {user.role === "DEVELOPER" && (
                  <li>• View developer dashboard</li>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <li>• Manage users</li>
                    <li>• Change user roles</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Current status of your account and verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user.status}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email Verification</p>
                  <p
                    className={`text-2xl font-bold ${
                      user.emailVerified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Pending"}
                  </p>
                </div>
                {user.emailVerified ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Profile Completion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {user.phone && user.profilePicture
                      ? "100%"
                      : user.phone || user.profilePicture
                      ? "75%"
                      : "50%"}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
