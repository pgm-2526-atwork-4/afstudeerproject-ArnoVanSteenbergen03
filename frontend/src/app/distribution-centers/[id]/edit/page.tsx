"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DistroForm from "@/components/distribution-centers/DistroForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DistributionCenter } from "@/types";

export default function EditDistributionCenterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [center, setCenter] = useState<DistributionCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/distribution-centers/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
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
      <ProtectedPage requiredPermission="update_places">
        <div className="flex items-center justify-center min-h-screen bg-amber-50">
          <div className="text-slate-800">Loading...</div>
        </div>
      </ProtectedPage>
    );
  }

  if (!user || !center) return null;

  const handleSubmit = async (data: Partial<DistributionCenter>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/distribution-centers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update distribution center",
        );
      }

      router.push("/distribution-centers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedPage requiredPermission="update_places">
      <DistroForm
        initialData={center}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
      />
    </ProtectedPage>
  );
}
