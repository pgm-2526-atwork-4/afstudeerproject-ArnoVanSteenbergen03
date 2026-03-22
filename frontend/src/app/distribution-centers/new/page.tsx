"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DistroForm from "@/components/distribution-centers/DistroForm";
import { useAuth } from "@/lib/auth-context";
import { createDistributionCenter } from "@/lib/api-distro";
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

      await createDistributionCenter(data);
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
