"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import {
  getUserById,
  updateUser,
  getAllPermissions,
  type AdminUserDetail,
  type Permission,
} from "@/lib/api-client";
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
import { LoadingScreen } from "@/components/ui/loading";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { z } from "zod/v4";

const USER_ROLES = ["admin", "manager", "provider", "volunteer"] as const;

const editUserSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  username: z.string().trim().min(1, "Username is required"),
  email: z.string().trim().email("Invalid email address"),
  userType: z.enum(USER_ROLES),
  permissionIds: z.array(z.number()),
});

export default function EditUserPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userData, setUserData] = useState<AdminUserDetail | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );

  useEffect(() => {
    if (authLoading || !authUser || !userId) return;

    const fetchData = async () => {
      try {
        const [user, perms] = await Promise.all([
          getUserById(userId),
          getAllPermissions(),
        ]);
        setUserData(user);
        setAllPermissions(perms);
        setFirstname(user.firstname);
        setLastname(user.lastname);
        setUsername(user.username);
        setEmail(user.email);
        setUserType(user.userType);
        setSelectedPermissionIds(user.permissionIds);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, authUser, userId]);

  const permissionsByResource = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    for (const p of allPermissions) {
      if (!grouped[p.resource]) grouped[p.resource] = [];
      grouped[p.resource].push(p);
    }
    return grouped;
  }, [allPermissions]);

  const togglePermission = (permId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  const toggleResourceGroup = (resource: string) => {
    const resourcePerms = permissionsByResource[resource] || [];
    const resourceIds = resourcePerms.map((p) => p.id);
    const allSelected = resourceIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    if (allSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !resourceIds.includes(id)),
      );
    } else {
      setSelectedPermissionIds((prev) => [
        ...prev,
        ...resourceIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const validated = editUserSchema.safeParse({
      firstname,
      lastname,
      username,
      email,
      userType,
      permissionIds: selectedPermissionIds,
    });

    if (!validated.success) {
      setSaving(false);
      setError(
        validated.error.issues[0]?.message || "Please check the form values.",
      );
      return;
    }

    try {
      await updateUser(userId, validated.data);
      router.push("/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedPage requiredPermission="update_users">
        <div className="min-h-screen bg-amber-50">
          <LoadingScreen />
        </div>
      </ProtectedPage>
    );
  }

  if (!authUser || !userData) return null;

  return (
    <ProtectedPage requiredPermission="update_users">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link href="/users">
            <Button
              variant="ghost"
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Edit User</h1>
            <div className="h-1 bg-slate-800 w-32 mx-auto mt-2"></div>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-2xl mx-auto w-full">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                User Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstname" className="text-slate-700 font-semibold">
                    First Name
                  </Label>
                  <Input
                    id="firstname"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastname" className="text-slate-700 font-semibold">
                    Last Name
                  </Label>
                  <Input
                    id="lastname"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="username" className="text-slate-700 font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 border-slate-300"
                  required
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="email" className="text-slate-700 font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 border-slate-300"
                  required
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="userType" className="text-slate-700 font-semibold">
                  Role
                </Label>
                <Select
                  value={userType}
                  onValueChange={(value) => setUserType(value)}
                >
                  <SelectTrigger id="userType" className="mt-1 w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800">
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

            <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Permissions
              </h2>

              <div className="space-y-4">
                {Object.entries(permissionsByResource).map(
                  ([resource, perms]) => {
                    const resourceIds = perms.map((p) => p.id);
                    const allChecked = resourceIds.every((id) =>
                      selectedPermissionIds.includes(id),
                    );
                    const someChecked =
                      !allChecked &&
                      resourceIds.some((id) =>
                        selectedPermissionIds.includes(id),
                      );

                    return (
                      <div
                        key={resource}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            id={`resource-${resource}`}
                            checked={allChecked ? true : someChecked ? "indeterminate" : false}
                            onCheckedChange={() => toggleResourceGroup(resource)}
                            className="border-slate-500 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                          />
                          <Label
                            htmlFor={`resource-${resource}`}
                            className="font-semibold text-slate-800 capitalize cursor-pointer"
                          >
                            {resource.replace(/_/g, " ")}
                          </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 ml-6">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <Checkbox
                                id={`perm-${resource}-${perm.id}`}
                                checked={selectedPermissionIds.includes(
                                  perm.id,
                                )}
                                onCheckedChange={() => togglePermission(perm.id)}
                                className="border-slate-500 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                              />
                              <Label
                                htmlFor={`perm-${resource}-${perm.id}`}
                                className="capitalize cursor-pointer"
                              >
                                {resource === "page"
                                  ? perm.key.replace(/^view_/, "").replace(/_/g, " ")
                                  : perm.action}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </ProtectedPage>
  );
}
