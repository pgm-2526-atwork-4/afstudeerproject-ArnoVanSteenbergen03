"use client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";

export default function AdminChatsPage() {
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
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Chat</h1>
            <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
          </div>
        </div>
        <div className="text-center text-slate-600 mt-8">
          Chat functionality coming soon...
        </div>
      </div>
      <AdminNavigation />
    </>
  );
}
