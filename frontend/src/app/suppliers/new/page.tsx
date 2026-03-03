"use client";

import ProtectedPage from "@/components/ProtectedPage";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupplier, type Supplier } from "@/lib/api-client";

export default function NewSupplierPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (data: Partial<Supplier>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createSupplier(data);
      router.push("/suppliers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedPage requiredPermission="create_places">
      <SupplierForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
      />
    </ProtectedPage>
  );
}
