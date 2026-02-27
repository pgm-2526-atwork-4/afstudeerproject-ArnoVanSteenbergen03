"use client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";

export default function DistributionCentersPage() {
  const { user, loading } = useAuth();
  useRequireRole("admin");

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

  // Mock data - replace with API call
  const distributionCenters = [
    {
      id: 1,
      name: "Downtown Distribution Center",
      address: "123 Main St, City, Country",
      phone: "+1 (555) 123-4567",
      email: "downtown@example.com",
      manager: "John Doe",
    },
    {
      id: 2,
      name: "Suburban Distribution Hub",
      address: "456 Oak Ave, Suburb, Country",
      phone: "+1 (555) 987-6543",
      email: "suburban@example.com",
      manager: "Jane Smith",
    },
  ];

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              Distribution Centers
            </h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2"></div>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Distribution Center
            </Button>
          </div>

          <div className="space-y-4">
            {distributionCenters.map((center) => (
              <div
                key={center.id}
                className="bg-white border-2 border-slate-800 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                      {center.name}
                    </h2>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {center.address}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {center.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {center.email}
                      </p>
                      <p>
                        <span className="font-semibold">Manager:</span>{" "}
                        {center.manager}
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
      <AdminNavigation />
    </>
  );
}
