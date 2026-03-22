"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import AdminDash from "@/components/dashboard/AdminDash";
import AdminDashSkeleton from "@/components/dashboard/AdminDashSkeleton";
import type { User } from "@/types";

function getFallbackRoute(permissions: string[]): string {
  if (permissions.includes("view_orders")) return "/orders";
  if (permissions.includes("view_deliveries")) return "/deliveries";
  if (permissions.includes("view_chatroom")) return "/chatroom";
  if (permissions.includes("view_profile")) return "/profile";
  return "/login";
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const permissions = user?.permissions ?? [];
  const canViewDashboard = permissions.includes("view_dashboard");
  const fallbackRoute = getFallbackRoute(permissions);

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

    if (!canViewDashboard) {
      router.push(fallbackRoute);
    }
  }, [user, loading, router, canViewDashboard, fallbackRoute]);

  if (loading) {
    return <AdminDashSkeleton />;
  }

  if (!user || !user.isApproved) return null;
  if (!canViewDashboard) return null;

  return (
    <ProtectedPage requiredPermission="view_dashboard">
      <AdminDash user={user} />
    </ProtectedPage>
  );
}
