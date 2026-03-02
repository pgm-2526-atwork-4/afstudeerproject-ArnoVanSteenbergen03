"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PermissionGate from "@/components/PermissionGate";
import { useAuth } from "@/lib/auth-context";
import { getApplicationCount } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, FileText } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    getApplicationCount()
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(null));
  }, []);

  if (!user) return null;

  // Mock data - replace with API call
  const users = [
    {
      id: 1,
      username: "admin_user",
      email: "admin@example.com",
      role: "admin",
      status: "Active",
    },
    {
      id: 2,
      username: "manager_user",
      email: "manager@example.com",
      role: "provider",
      status: "Active",
    },
    {
      id: 3,
      username: "volunteer_user",
      email: "volunteer@example.com",
      role: "volunteer",
      status: "Active",
    },
  ];

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

  const getStatusBadgeColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";
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
                            usr.role,
                          )}`}
                        >
                          {usr.role}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                            usr.status,
                          )}`}
                        >
                          {usr.status}
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
        </div>
      </div>
    </ProtectedPage>
  );
}
