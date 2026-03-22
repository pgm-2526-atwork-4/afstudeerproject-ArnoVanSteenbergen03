"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PermissionGate from "@/components/PermissionGate";
import { useAuth } from "@/lib/auth-context";
import {
  getApplicationCount,
  getUsers,
  deleteUser,
  createUser,
  getAllPermissions,
  checkEmailAvailable,
  AdminUser,
  type Permission,
} from "@/lib/api-client";
import { createUserSchema } from "@shared/schemas/users";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/loading";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

const ALL_ROLES_FILTER = "__all_roles__";

export default function UsersPage() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<number>
  >(new Set());
  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    userType: "volunteer",
  });

  useEffect(() => {
    getApplicationCount()
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        const data = await getUsers(roleFilter || undefined);
        if (!cancelled) {
          setUsers(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch users",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [roleFilter]);

  const permissionGrid = useMemo(() => {
    const crudPermissions = allPermissions.filter((p) => p.resource !== "page");
    const pagePermissions = allPermissions.filter((p) => p.resource === "page");
    const resources = [...new Set(crudPermissions.map((p) => p.resource))];
    const actions = ["create", "read", "update", "delete"];
    return { resources, actions, crudPermissions, pagePermissions };
  }, [allPermissions]);

  if (!user) return null;

  const openDeleteModal = (userId: string, username: string) => {
    setConfirmDeleteId(userId);
    setConfirmDeleteName(username);
  };

  const closeDeleteModal = () => {
    if (!deleteLoading) {
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    }
  };

  const performDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteUser(confirmDeleteId);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateStep1 = (): string | null => {
    const result = createUserSchema.safeParse({
      ...newUser,
      permissionIds: [],
    });
    if (result.success) return null;
    const issue = result.error.issues[0];
    return issue?.message || "Validation failed";
  };

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      await createUser({
        ...newUser,
        permissionIds: Array.from(selectedPermissionIds),
      });
      closeCreateDialog();
      const data = await getUsers(roleFilter || undefined);
      setUsers(data);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create user",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreateDialog = async () => {
    setShowCreateDialog(true);
    setCreateStep(1);
    setCreateError(null);
    setSelectedPermissionIds(new Set());
    setNewUser({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      userType: "volunteer",
    });
    if (allPermissions.length === 0) {
      try {
        const perms = await getAllPermissions();
        setAllPermissions(perms);
      } catch (err) {
        console.error("Failed to load permissions:", err);
      }
    }
  };

  const closeCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateStep(1);
    setCreateError(null);
    setSelectedPermissionIds(new Set());
    setNewUser({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      userType: "volunteer",
    });
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleResourceRow = (resource: string) => {
    const resourcePerms = allPermissions.filter(
      (p) => p.resource === resource && resource !== "page",
    );
    const allSelected = resourcePerms.every((p) =>
      selectedPermissionIds.has(p.id),
    );
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      resourcePerms.forEach((p) => {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      });
      return next;
    });
  };

  const getPermissionByResourceAction = (resource: string, action: string) =>
    allPermissions.find((p) => p.resource === resource && p.action === action);

  const formatResource = (r: string) =>
    r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatPageKey = (key: string) =>
    key
      .replace("view_", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "manager":
        return "bg-violet-100 text-violet-800 border-violet-300";
      case "provider":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "volunteer":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <ProtectedPage requiredPermission="view_users">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8 lg:ml-20 relative z-10">
          <Link href="/dashboard">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Users & Permissions
            </h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2"></div>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <PermissionGate permission="create_users">
            <div className="mb-6">
              <Button
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                onClick={() => openCreateDialog()}
              >
                <Plus className="w-5 h-5" />
                Add New User
              </Button>
            </div>
          </PermissionGate>

          <PermissionGate permission="read_applications">
            <div className="mb-6">
              <Link href="/applications">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 relative">
                  <FileText className="w-5 h-5" />
                  Applications
                  {pendingCount !== null && pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-1.5">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </PermissionGate>

          <div className="mb-6">
            <Select
              value={roleFilter || ALL_ROLES_FILTER}
              onValueChange={(value) =>
                setRoleFilter(value === ALL_ROLES_FILTER ? "" : value)
              }
            >
              <SelectTrigger className="w-full border-2 border-slate-800 rounded-lg px-4 py-3 bg-white text-slate-800 font-semibold">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ROLES_FILTER}>All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && <CardSkeleton />}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              No users found.
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {users.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-white border-2 border-[#2D3E2D] rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-3">
                        {usr.username}
                      </h2>
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {usr.email}
                        </p>
                        <div className="flex gap-2 items-center">
                          <span className="font-semibold">Role:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              usr.userType,
                            )}`}
                          >
                            {usr.userType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PermissionGate permission="update_users">
                        <Link href={`/users/${usr.id}/edit`}>
                          <Button
                            variant="outline"
                            className="border-slate-800 text-slate-800 hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission="delete_users">
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => openDeleteModal(usr.id, usr.username)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) closeDeleteModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {confirmDeleteName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700 border border-red-600"
              onClick={performDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-[#2D3E2D] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {createStep === 1 && "Step 1: User Details"}
                  {createStep === 2 && "Step 2: Page Access"}
                  {createStep === 3 && "Step 3: Data Permissions"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new user account
                </p>
              </div>
              <Button
                variant="ghost"
                className="p-1 h-auto"
                onClick={closeCreateDialog}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-6">
              {createError && (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-4 text-sm">
                  {createError}
                </div>
              )}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="create-firstname"
                        className="text-slate-700 font-semibold"
                      >
                        First Name
                      </Label>
                      <Input
                        id="create-firstname"
                        value={newUser.firstname}
                        onChange={(e) =>
                          setNewUser((p) => ({
                            ...p,
                            firstname: e.target.value,
                          }))
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="create-lastname"
                        className="text-slate-700 font-semibold"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="create-lastname"
                        value={newUser.lastname}
                        onChange={(e) =>
                          setNewUser((p) => ({
                            ...p,
                            lastname: e.target.value,
                          }))
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="create-email"
                      className="text-slate-700 font-semibold"
                    >
                      Email
                    </Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser((p) => ({ ...p, email: e.target.value }))
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="create-password"
                      className="text-slate-700 font-semibold"
                    >
                      Password
                    </Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser((p) => ({ ...p, password: e.target.value }))
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="create-role"
                      className="text-slate-700 font-semibold"
                    >
                      Role
                    </Label>
                    <Select
                      value={newUser.userType}
                      onValueChange={(value) =>
                        setNewUser((p) => ({ ...p, userType: value }))
                      }
                    >
                      <SelectTrigger
                        id="create-role"
                        className="mt-1 w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="provider">Provider</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Select which pages this user can access.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {permissionGrid.pagePermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPermissionIds.has(perm.id)
                            ? "bg-green-50 border-green-400"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Checkbox
                          id={`create-page-perm-${perm.id}`}
                          checked={selectedPermissionIds.has(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <Label
                          htmlFor={`create-page-perm-${perm.id}`}
                          className="text-sm font-medium text-slate-800 cursor-pointer"
                        >
                          {formatPageKey(perm.key)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {createStep === 3 && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Select which data operations this user can perform.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left p-3 font-semibold text-slate-700 border border-slate-300 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="create-all-crud-perms"
                                checked={
                                  permissionGrid.crudPermissions.length > 0 &&
                                  permissionGrid.crudPermissions.every((p) =>
                                    selectedPermissionIds.has(p.id),
                                  )
                                }
                                onCheckedChange={() => {
                                  const crudPerms =
                                    permissionGrid.crudPermissions;
                                  const allSelected = crudPerms.every((p) =>
                                    selectedPermissionIds.has(p.id),
                                  );
                                  setSelectedPermissionIds((prev) => {
                                    const next = new Set(prev);
                                    crudPerms.forEach((p) => {
                                      if (allSelected) next.delete(p.id);
                                      else next.add(p.id);
                                    });
                                    return next;
                                  });
                                }}
                              />
                              <Label
                                htmlFor="create-all-crud-perms"
                                className="cursor-pointer"
                              >
                                Resource
                              </Label>
                            </div>
                          </th>
                          {permissionGrid.actions.map((action) => (
                            <th
                              key={action}
                              className="text-center p-3 font-semibold text-slate-700 border border-slate-300 capitalize w-24"
                            >
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {permissionGrid.resources.map((resource) => {
                          const resourcePerms = allPermissions.filter(
                            (p) => p.resource === resource,
                          );
                          const allRowSelected = resourcePerms.every((p) =>
                            selectedPermissionIds.has(p.id),
                          );
                          return (
                            <tr
                              key={resource}
                              className="hover:bg-amber-50 transition-colors"
                            >
                              <td className="p-3 border border-slate-300 font-medium text-slate-800">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`create-resource-${resource}`}
                                    checked={allRowSelected}
                                    onCheckedChange={() =>
                                      toggleResourceRow(resource)
                                    }
                                  />
                                  <Label
                                    htmlFor={`create-resource-${resource}`}
                                    className="cursor-pointer"
                                  >
                                    {formatResource(resource)}
                                  </Label>
                                </div>
                              </td>
                              {permissionGrid.actions.map((action) => {
                                const perm = getPermissionByResourceAction(
                                  resource,
                                  action,
                                );
                                return (
                                  <td
                                    key={action}
                                    className="text-center p-3 border border-slate-300"
                                  >
                                    {perm ? (
                                      <Checkbox
                                        id={`create-perm-${resource}-${action}-${perm.id}`}
                                        checked={selectedPermissionIds.has(
                                          perm.id,
                                        )}
                                        onCheckedChange={() =>
                                          togglePermission(perm.id)
                                        }
                                      />
                                    ) : (
                                      <span className="text-slate-300">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {(createStep === 2 || createStep === 3) && (
                <p className="text-xs text-slate-400 mt-3">
                  {selectedPermissionIds.size} of {allPermissions.length}{" "}
                  permissions selected
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 p-6 flex gap-3">
              {createStep === 1 && (
                <>
                  <Button
                    className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold"
                    disabled={
                      !newUser.firstname ||
                      !newUser.lastname ||
                      !newUser.email ||
                      !newUser.password ||
                      createLoading
                    }
                    onClick={async () => {
                      const err = validateStep1();
                      if (err) {
                        setCreateError(err);
                        return;
                      }
                      setCreateError(null);
                      setCreateLoading(true);
                      try {
                        const available = await checkEmailAvailable(
                          newUser.email,
                        );
                        if (!available) {
                          setCreateError("Email is already in use");
                          return;
                        }
                        setCreateStep(2);
                      } catch {
                        setCreateError("Failed to verify email");
                      } finally {
                        setCreateLoading(false);
                      }
                    }}
                  >
                    Next: Page Access
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
              {createStep === 2 && (
                <>
                  <Button
                    variant="outline"
                    className="border-slate-300"
                    onClick={() => setCreateStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold"
                    onClick={() => setCreateStep(3)}
                  >
                    Next: Data Permissions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
              {createStep === 3 && (
                <>
                  <Button
                    variant="outline"
                    className="border-slate-300"
                    onClick={() => setCreateStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    disabled={createLoading}
                    onClick={handleCreateUser}
                  >
                    {createLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Create with {selectedPermissionIds.size} permission
                    {selectedPermissionIds.size !== 1 ? "s" : ""}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
