"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!user) return;

    // Not approved yet — show pending screen
    if (!user.isApproved) {
      router.push("/pending");
      return;
    }

    // Redirect based on userType
    if (user.userType === "provider") {
      router.push("/provider");
    } else if (user.userType === "volunteer") {
      router.push("/volunteer");
    } else if (user.userType === "admin") {
      router.push("/admin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return null;
}