"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";

export default function SuppliersPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Mock data - replace with API call
  const suppliers = [
    {
      id: 1,
      name: "Fresh Produce Inc.",
      email: "contact@freshproduce.com",
      phone: "+1 (555) 111-2222",
      address: "789 Farm Lane, Rural Area, Country",
      contact: "Bob Johnson",
    },
    {
      id: 2,
      name: "Organic Foods Co.",
      email: "info@organicfood.com",
      phone: "+1 (555) 333-4444",
      address: "321 Green Way, Countryside, Country",
      contact: "Alice Green",
    },
  ];

  return (
    <ProtectedPage>
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
          <div className="mb-6">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Supplier
            </Button>
          </div>

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
                      <p>
                        <span className="font-semibold">Contact:</span>{" "}
                        {supplier.contact}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {supplier.email}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {supplier.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {supplier.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-800 text-slate-800 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
