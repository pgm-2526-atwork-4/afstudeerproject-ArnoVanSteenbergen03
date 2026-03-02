"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireRole(role: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.userType !== role) {
      router.push("/dashboard");
    }
  }, [user, loading, router, role]);

  const authorized = !loading && !!user && user.userType === role;

  return { user, loading, authorized };
}
