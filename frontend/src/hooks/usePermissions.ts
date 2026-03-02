"use client";

import { useAuth } from "@/lib/auth-context";

export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions ?? [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAllPermissions = (...required: string[]): boolean => {
    return required.every((p) => permissions.includes(p));
  };

  const hasAnyPermission = (...required: string[]): boolean => {
    return required.some((p) => permissions.includes(p));
  };

  return { permissions, hasPermission, hasAllPermissions, hasAnyPermission };
}
