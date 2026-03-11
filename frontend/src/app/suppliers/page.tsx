"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PermissionGate from "@/components/PermissionGate";
import { useAuth } from "@/lib/auth-context";
import { getSuppliers, deleteSupplier, type Supplier } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function SuppliersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        if (!cancelled) {
          setSuppliers(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch suppliers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchSuppliers();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteSupplier(deleteTarget.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete supplier");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedPage requiredPermission="read_places">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Suppliers
            </h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2"></div>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <PermissionGate permission="create_places">
            <div className="mb-6">
              <Button
                onClick={() => router.push("/suppliers/new")}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Supplier
              </Button>
            </div>
          </PermissionGate>

          {loading && <CardSkeleton />}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {!loading && !error && suppliers.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              No suppliers found.
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white border-2 border-slate-800 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 mb-2">
                        {supplier.name}
                      </h2>
                      <div className="space-y-1 text-sm text-slate-700">
                        {supplier.contactInfo?.email && (
                          <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {supplier.contactInfo.email}
                          </p>
                        )}
                        {supplier.contactInfo?.phone && (
                          <p>
                            <span className="font-semibold">Phone:</span>{" "}
                            {supplier.contactInfo.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PermissionGate permission="update_places">
                        <Button
                          onClick={() =>
                            router.push(`/suppliers/${supplier.id}/edit`)
                          }
                          variant="outline"
                          className="border-slate-800 text-slate-800 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="delete_places">
                        <Button
                          onClick={() => setDeleteTarget(supplier)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  );
}
