"use client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/hooks/useRequireRole";
import { Button } from "@/components/ui/button";
import { getDistributionCenters } from "@/lib/api-client";
import { DistributionCenter } from "@/types";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DistributionCentersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useRequireRole("admin");

  const [centers, setCenters] = useState<DistributionCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setIsLoading(true);
        const data = await getDistributionCenters();
        setCenters(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch centers",
        );
        setCenters([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchCenters();
    }
  }, [loading, user]);

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
            <Button
              onClick={() => router.push("/admin/distribution-centers/new")}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Distribution Center
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-slate-600 py-8">
              Loading distribution centers...
            </div>
          ) : centers.length === 0 ? (
            <div className="text-center text-slate-600 py-8">
              No distribution centers found. Create one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {centers.map((center) => (
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
                        {center.contactInfo?.phone && (
                          <p>
                            <span className="font-semibold">Phone:</span>{" "}
                            {center.contactInfo.phone}
                          </p>
                        )}
                        {center.contactInfo?.email && (
                          <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {center.contactInfo.email}
                          </p>
                        )}
                        {center.operatingInfo && (
                          <p className="mt-2">
                            <span className="font-semibold">
                              Operating Hours:
                            </span>
                            <br />
                            {Object.entries(center.operatingInfo)
                              .filter(([, value]) => value)
                              .map(([day, hours]) => (
                                <span key={day} className="block text-xs">
                                  {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                                  {hours &&
                                  typeof hours === "object" &&
                                  "open" in hours
                                    ? `${hours.open} - ${hours.close}`
                                    : String(hours)}
                                </span>
                              ))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          router.push(
                            `/admin/distribution-centers/${center.id}/edit`,
                          )
                        }
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
          )}
        </div>
      </div>
      <AdminNavigation />
    </>
  );
}
