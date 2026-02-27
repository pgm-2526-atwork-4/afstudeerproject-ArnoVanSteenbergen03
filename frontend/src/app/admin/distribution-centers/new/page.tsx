"use client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import DistroForm from "@/components/admin/screens/DistroForm";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DistributionCenter } from "@/types";

export default function NewDistributionCenterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useRequireRole("admin");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: Partial<DistributionCenter>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/distro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create distribution center");
      }

      router.push("/admin/distribution-centers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DistroForm onSubmit={handleSubmit} isLoading={isSubmitting} error={error} />
      <AdminNavigation />
    </>
  );
}
