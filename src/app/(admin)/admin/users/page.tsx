"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, Trash2, Plus } from "lucide-react";
import { User, UserRole, UserStatus } from "@prisma/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const UsersPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchUserId, setSearchUserId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState<UserRole | "ALL">("ALL");
  const [searchStatus, setSearchStatus] = useState<UserStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserStatus, setNewUserStatus] = useState<UserStatus | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      if (searchUserId) params.append("userId", searchUserId);
      if (searchEmail) params.append("email", searchEmail);
      if (searchRole && searchRole !== "ALL") params.append("role", searchRole);
      if (searchStatus && searchStatus !== "ALL")
        params.append("status", searchStatus);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    searchUserId,
    searchEmail,
    searchRole,
    searchStatus,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleUpdateUserStatus = async () => {
    if (!editingUserId || !newUserStatus) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newUserStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user status");
      }

      toast({
        title: "Success",
        description: "User status updated successfully!",
      });
      fetchUsers(); // Refresh the list to reflect the change
    } catch (err: unknown) {
      console.error("Failed to update user status:", err);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to update user status.",
        variant: "destructive",
      });
    } finally {
      setEditingUserId(null);
      setNewUserStatus(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User successfully deleted!",
      });
      fetchUsers(); // Refresh the list
      setUserToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete user:", err);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to delete user.",
        variant: "destructive",
      });
      setError("Failed to delete user.");
    }
  };

  const handleCreateUser = () => {
    router.push("/admin/users/new");
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <React.Fragment>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by User ID"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            onBlur={fetchUsers}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchUsers();
            }}
          />
          <Input
            placeholder="Search by Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onBlur={fetchUsers}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchUsers();
            }}
          />
          <Select
            value={searchRole}
            onValueChange={(value: string) => {
              setSearchRole((value === "" ? "ALL" : value) as UserRole | "ALL");
              fetchUsers();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchStatus}
            onValueChange={(value: string) => {
              setSearchStatus(
                (value === "" ? "ALL" : value) as UserStatus | "ALL"
              );
              fetchUsers();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-card text-card-foreground shadow-md rounded-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary text-secondary-foreground">
                <TableRow>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    User ID{" "}
                    {sortBy === "id" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email{" "}
                    {sortBy === "email" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    Role{" "}
                    {sortBy === "role" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortBy === "status" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Creation Date{" "}
                    {sortBy === "createdAt" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-y divide-border">
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.role}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        <Select
                          value={user.status}
                          onValueChange={(value: string) => {
                            setEditingUserId(user.id);
                            setNewUserStatus(value as UserStatus);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0) +
                                  status.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-primary hover:text-primary/80 mr-4"
                        >
                          View/Edit
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setUserToDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the user {userToDelete} and
                                remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteUser}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center p-4">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!editingUserId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUserId(null);
            setNewUserStatus(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of user{" "}
              <strong>{editingUserId}</strong> to{" "}
              <strong>{newUserStatus?.toLowerCase()}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateUserStatus}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};

export default UsersPage;
