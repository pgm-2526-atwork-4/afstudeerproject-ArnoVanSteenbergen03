"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import AdminDash from "@/components/dashboard/AdminDash";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.userType === "admin";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    if (!user.isApproved) {
      router.push("/pending");
      return;
    }

    // Non-admin users get redirected to their main page
    if (!isAdmin) {
      if (user.userType === "provider") {
        router.push("/orders");
      } else {
        router.push("/deliveries");
      }
    }
  }, [user, loading, router, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user || !user.isApproved) return null;

  // Admin users see the dashboard
  if (isAdmin) {
    return (
      <ProtectedPage>
        <AdminDash user={user} />
      </ProtectedPage>
    );
  }

  return null;
}