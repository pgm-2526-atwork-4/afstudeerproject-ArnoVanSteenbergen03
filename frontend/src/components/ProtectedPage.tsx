"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import AppNavigation from "@/components/AppNavigation";

interface ProtectedPageProps {
  children: React.ReactNode;
  /** If set, user must have this permission to view the page */
  requiredPermission?: string;
  /** If set, user must have at least one of these permissions */
  requiredAnyPermission?: string[];
}

export default function ProtectedPage({
  children,
  requiredPermission,
  requiredAnyPermission,
}: ProtectedPageProps) {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const router = useRouter();

  const hasAccess =
    !requiredPermission && !requiredAnyPermission
      ? true
      : (requiredPermission ? hasPermission(requiredPermission) : true) &&
        (requiredAnyPermission
          ? hasAnyPermission(...requiredAnyPermission)
          : true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && !user.isApproved) {
      router.push("/pending");
    } else if (!loading && user && user.isApproved && !hasAccess) {
      router.push("/dashboard");
    }
  }, [user, loading, router, hasAccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user || !user.isApproved || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <div className="flex-1 overflow-y-auto pb-24">{children}</div>
      <AppNavigation />
    </div>
  );
}
