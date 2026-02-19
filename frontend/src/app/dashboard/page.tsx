"use client";

import { useAuth } from "@/lib/auth-context";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  if (user.role === "volunteer") {
    return <VolunteerDashboard user={user} />;
  }

  if (user.role === "provider") {
    return <ProviderDashboard user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <p className="text-slate-600">Unknown role</p>
    </div>
  );
}

function VolunteerDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Hello, {user.username}! 👋
        </h1>
        <p className="text-2xl font-semibold text-orange-600 mb-8">
          Welcome Volunteer
        </p>
        <p className="text-center text-slate-600 max-w-md">
          Ready to help pick up food orders from providers? Let&apos;s make a
          difference together!
        </p>
      </div>
    </div>
  );
}

function ProviderDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Hello, {user.username}! 👋
        </h1>
        <p className="text-2xl font-semibold text-orange-600 mb-8">
          Welcome Provider
        </p>
        <p className="text-center text-slate-600 max-w-md">
          Have leftovers? Let us help you donate food and make a positive
          impact!
        </p>
      </div>
    </div>
  );
}
