"use client";

import ProtectedPage from "@/components/ProtectedPage";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getSupplierById,
  updateSupplier,
  type Supplier,
} from "@/lib/api-client";

export default function EditSupplierPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        const data = await getSupplierById(id);
        setSupplier(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load supplier",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user && id) {
      fetchSupplier();
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

  if (!user || !supplier) return null;

  const handleSubmit = async (data: Partial<Supplier>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateSupplier(id, data);
      router.push("/suppliers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedPage requiredPermission="update_places">
      <SupplierForm
        initialData={supplier}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={error}
      />
    </ProtectedPage>
  );
}
