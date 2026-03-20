"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import AppNavigation from "@/components/AppNavigation";
import { usePathname } from "next/navigation";

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredPermission?: string;
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
  const pathname = usePathname();
  const isChatroom = pathname?.startsWith("/chatroom");

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
    return null;
  }

  if (!user || !user.isApproved || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <div
        className={`flex-1 ${
          isChatroom
            ? "min-h-0 overflow-hidden"
            : "overflow-y-auto pb-24 lg:pb-0"
        }`}
      >
        {children}
      </div>
      <AppNavigation />
    </div>
  );
}
