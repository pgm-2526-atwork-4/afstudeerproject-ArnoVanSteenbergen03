"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DistroForm from "@/components/distribution-centers/DistroForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DistributionCenter } from "@/types";

export default function NewDistributionCenterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (data: Partial<DistributionCenter>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/distribution-centers`,
        {
          method: "POST",
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
          errorData.error || "Failed to create distribution center",
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
    <ProtectedPage requiredPermission="create_places">
      <DistroForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
      />
    </ProtectedPage>
  );
}
