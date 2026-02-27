"use client";

import { DistributionCenter } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DistroFormProps {
  initialData?: DistributionCenter;
  onSubmit: (data: Partial<DistributionCenter>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function DistroForm({
  initialData,
  onSubmit,
  isLoading = false,
  error,
}: DistroFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: (initialData?.type as "provider" | "distribution_center") || "distribution_center",
    contactInfo: {
      phone: initialData?.contactInfo?.phone || "",
      email: initialData?.contactInfo?.email || "",
    },
    operatingInfo: {
      monday: initialData?.operatingInfo?.monday || "",
      tuesday: initialData?.operatingInfo?.tuesday || "",
      wednesday: initialData?.operatingInfo?.wednesday || "",
      thursday: initialData?.operatingInfo?.thursday || "",
      friday: initialData?.operatingInfo?.friday || "",
      saturday: initialData?.operatingInfo?.saturday || "",
      sunday: initialData?.operatingInfo?.sunday || "",
    },
    coordinates: {
      lat: initialData?.geojson?.coordinates[1] || 0,
      lng: initialData?.geojson?.coordinates[0] || 0,
    },
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (
    section: "contactInfo" | "operatingInfo" | "coordinates",
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      if (section === "contactInfo") {
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [field]: value,
          },
        };
      } else if (section === "operatingInfo") {
        return {
          ...prev,
          operatingInfo: {
            ...prev.operatingInfo,
            [field]: value,
          },
        };
      } else if (section === "coordinates") {
        return {
          ...prev,
          coordinates: {
            ...prev.coordinates,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: Partial<DistributionCenter> = {
      name: formData.name,
      type: formData.type,
      contactInfo: formData.contactInfo,
      operatingInfo: formData.operatingInfo,
      geojson: {
        type: "Point",
        coordinates: [formData.coordinates.lng, formData.coordinates.lat],
      },
    };

    await onSubmit(submitData);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin/distribution-centers">
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-slate-800" />
          </Button>
        </Link>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-slate-800">
            {initialData ? "Edit" : "Add"} Distribution Center
          </h1>
          <div className="h-1 bg-slate-800 w-48 mx-auto mt-2"></div>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Name
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  required
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Type
                </Label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                >
                  <option value="distribution_center">Distribution Center</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Contact Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Phone
                </Label>
                <Input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) =>
                    handleNestedChange("contactInfo", "phone", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) =>
                    handleNestedChange("contactInfo", "email", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Operating Hours
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                (day) => (
                  <div key={day}>
                    <Label className="block text-sm font-semibold text-slate-800 mb-2">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., 9AM-5PM"
                      value={
                        formData.operatingInfo[
                          day as keyof typeof formData.operatingInfo
                        ]
                      }
                      onChange={(e) =>
                        handleNestedChange("operatingInfo", day, e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-slate-800 rounded text-sm"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Location (Coordinates)
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.coordinates.lat}
                  onChange={(e) =>
                    handleNestedChange(
                      "coordinates",
                      "lat",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  required
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.coordinates.lng}
                  onChange={(e) =>
                    handleNestedChange(
                      "coordinates",
                      "lng",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded"
            >
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update Center"
                : "Create Center"}
            </Button>
            <Link href="/admin/distribution-centers" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-800 text-slate-800 hover:bg-slate-100 font-bold py-3"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
