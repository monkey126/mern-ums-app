import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from "@/services/adminService";
import type { User, UserRole, UserStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Edit,
  Loader2,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: () =>
      adminService.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "DEVELOPER":
        return "bg-blue-100 text-blue-800";
      case "MODERATOR":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Check if the current user can delete the target user
   * Prevents:
   * - Self-deletion
   * - Deleting other admin users
   * - Deleting active users (must be inactive first)
   */
  const canDeleteUser = (targetUser: User): boolean => {
    // Prevent self-deletion
    if (currentUser?.id === targetUser.id) {
      return false;
    }

    // Prevent deleting admin users
    if (targetUser.role === "ADMIN") {
      return false;
    }

    // User must be inactive before deletion
    if (targetUser.status !== "INACTIVE") {
      return false;
    }

    return true;
  };

  /**
   * Check if the current user can edit the target user's role
   * Prevents:
   * - Self-role modification
   * - Modifying other admin users (unless super admin)
   */
  const canEditUserRole = (targetUser: User): boolean => {
    // Prevent self-role modification
    if (currentUser?.id === targetUser.id) {
      return false;
    }

    // Prevent modifying other admins unless current user is also admin
    if (targetUser.role === "ADMIN" && currentUser?.role !== "ADMIN") {
      return false;
    }

    return true;
  };

  /**
   * Get tooltip message for disabled delete button
   */
  const getDeleteDisabledReason = (targetUser: User): string => {
    if (currentUser?.id === targetUser.id) {
      return "You cannot delete your own account";
    }

    if (targetUser.role === "ADMIN") {
      return "Admin users cannot be deleted";
    }

    if (targetUser.status !== "INACTIVE") {
      return "User must be inactive before deletion";
    }

    return "";
  };

  /**
   * Check if the current user can edit the target user
   * Prevents:
   * - Self-editing (admins shouldn't modify their own critical settings)
   * - Editing other admin users (unless super admin)
   */
  const canEditUser = (targetUser: User): boolean => {
    // Prevent self-editing for admins (to avoid accidental privilege loss)
    if (currentUser?.id === targetUser.id && currentUser?.role === "ADMIN") {
      return false;
    }

    // Prevent editing other admins unless current user is also admin
    if (targetUser.role === "ADMIN" && currentUser?.role !== "ADMIN") {
      return false;
    }

    return true;
  };

  /**
   * Get tooltip message for disabled edit button
   */
  const getEditDisabledReason = (targetUser: User): string => {
    if (currentUser?.id === targetUser.id && currentUser?.role === "ADMIN") {
      return "Admins cannot edit their own account to prevent accidental privilege loss";
    }

    if (targetUser.role === "ADMIN" && currentUser?.role !== "ADMIN") {
      return "You cannot edit other admin users";
    }

    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage system users and permissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value: UserRole | "all") => setRoleFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="DEVELOPER">Developer</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value: UserStatus | "all") =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle>Users ({usersData?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users && usersData.users.length > 0 ? (
                    usersData.users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {canEditUser(user) ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled
                                  className="text-gray-400"
                                  title={getEditDisabledReason(user)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canDeleteUser(user) ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled
                                  className="text-gray-400"
                                  title={getDeleteDisabledReason(user)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No users found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: UserRole) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                  disabled={!canEditUserRole(selectedUser)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {!canEditUserRole(selectedUser) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentUser?.id === selectedUser.id
                      ? "You cannot modify your own role"
                      : "Admin roles cannot be modified"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value: UserStatus) =>
                    setSelectedUser({ ...selectedUser, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  // Find the original user data to compare changes
                  const originalUser = usersData?.users.find(
                    (u) => u.id === selectedUser.id
                  );
                  if (originalUser) {
                    // Only send fields that have actually changed
                    const updatedData: Partial<User> = {};

                    if (selectedUser.name !== originalUser.name) {
                      updatedData.name = selectedUser.name;
                    }
                    if (selectedUser.email !== originalUser.email) {
                      updatedData.email = selectedUser.email;
                    }
                    if (selectedUser.phone !== originalUser.phone) {
                      updatedData.phone = selectedUser.phone;
                    }
                    if (selectedUser.role !== originalUser.role) {
                      updatedData.role = selectedUser.role;
                    }
                    if (selectedUser.status !== originalUser.status) {
                      updatedData.status = selectedUser.status;
                    }

                    // Only make the API call if there are actual changes
                    if (Object.keys(updatedData).length > 0) {
                      updateUserMutation.mutate({
                        id: selectedUser.id,
                        data: updatedData,
                      });
                    } else {
                      // No changes detected
                      setIsEditDialogOpen(false);
                    }
                  }
                }
              }}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={userToDelete.profilePicture} />
                    <AvatarFallback>
                      {userToDelete.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{userToDelete.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {userToDelete.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(userToDelete.role)}>
                        {userToDelete.role}
                      </Badge>
                      <Badge className={getStatusColor(userToDelete.status)}>
                        {userToDelete.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the
                  user account and all associated data.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                userToDelete && deleteUserMutation.mutate(userToDelete.id)
              }
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
