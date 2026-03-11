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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/loading";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";

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

    try {
      await updateUser(userId, {
        firstname,
        lastname,
        username,
        email,
        userType,
        permissionIds: selectedPermissionIds,
      });
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
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mt-1 w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                >
                  <option value="admin">Admin</option>
                  <option value="provider">Provider</option>
                  <option value="volunteer">Volunteer</option>
                </select>
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
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = someChecked;
                            }}
                            onChange={() => toggleResourceGroup(resource)}
                            className="w-4 h-4 rounded accent-slate-800"
                          />
                          <span className="font-semibold text-slate-800 capitalize">
                            {resource.replace(/_/g, " ")}
                          </span>
                        </label>

                        <div className="grid grid-cols-2 gap-2 ml-6">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissionIds.includes(
                                  perm.id,
                                )}
                                onChange={() => togglePermission(perm.id)}
                                className="w-3.5 h-3.5 rounded accent-slate-800"
                              />
                              <span className="capitalize">
                                {resource === "page"
                                  ? perm.key.replace(/^view_/, "").replace(/_/g, " ")
                                  : perm.action}
                              </span>
                            </label>
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
