"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PermissionGate from "@/components/PermissionGate";
import { useAuth } from "@/lib/auth-context";
import { getApplicationCount, getUsers, AdminUser } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Loader2 } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");

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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchUsers();
    return () => { cancelled = true; };
  }, [roleFilter]);

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "provider":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "volunteer":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };



  return (
    <ProtectedPage requiredPermission="read_users">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="p-0 h-auto hover:bg-transparent"
            >
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
              <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border-2 border-slate-800 rounded-lg px-4 py-3 bg-white text-slate-800 font-semibold"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="provider">Provider</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            </div>
          )}

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
                className="bg-white border-2 border-slate-800 rounded-lg p-6"
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
                      <Button
                        variant="outline"
                        className="border-slate-800 text-slate-800 hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="delete_users">
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
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
    </ProtectedPage>
  );
}
