"use client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import DistroForm from "@/components/admin/screens/DistroForm";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DistributionCenter } from "@/types";

export default function EditDistributionCenterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  useRequireRole("admin");

  const [center, setCenter] = useState<DistributionCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/distro/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch distribution center");
        }

        const data = await response.json();
        setCenter(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load center");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user && id) {
      fetchCenter();
    }
  }, [loading, user, id]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-slate-800">Loading...</div>
      </div>
    );
  }

  if (!user || !center) {
    return null;
  }

  const handleSubmit = async (data: Partial<DistributionCenter>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/distro/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update distribution center");
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
      <DistroForm
        initialData={center}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
      />
      <AdminNavigation />
    </>
  );
}
