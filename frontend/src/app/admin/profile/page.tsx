"use client";

import ProfileScreen from "@/components/admin/screens/ProfileScreen";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";

export default function AdminProfilePage() {
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
      <ProfileScreen user={user} />
      <AdminNavigation />
    </>
  );
}
