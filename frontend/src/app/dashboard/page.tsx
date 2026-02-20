"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import VolunteerLayout from "@/components/volunteer/VolunteerLayout";
import ProviderLayout from "@/components/provider/ProviderLayout";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.roles?.includes("volunteer")) {
    return <VolunteerLayout user={user} />;
  }

  if (user.roles?.includes("provider")) {
    return <ProviderLayout user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <p className="text-slate-600">Unknown role</p>
    </div>
  );
}