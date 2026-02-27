"use client";

import AdminDash from "@/components/admin/screens/AdminDash";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";

export default function AdminPage() {
  const { user, loading } = useAuth();
  useRequireRole("admin");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-slate-800">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <AdminDash user={user} />
      <AdminNavigation />
    </>
  );
}
