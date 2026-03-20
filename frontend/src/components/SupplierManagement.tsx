"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { OperatingInfo } from "@shared/index";
import OpeningHoursForm from "@/components/OpeningHoursForm";
import { supplierFormSchema, toSupplierPayload } from "@/lib/place-form-validation";
import { X } from "lucide-react";

interface SupplierData {
  id?: string;
  name: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  operatingInfo: OperatingInfo;
  geojson: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface SupplierManagementProps {
  user: User;
}

const DEFAULT_OPERATING_INFO: OperatingInfo = {
  monday: { open: "08:00", close: "17:00" },
  tuesday: { open: "08:00", close: "17:00" },
  wednesday: { open: "08:00", close: "17:00" },
  thursday: { open: "08:00", close: "17:00" },
  friday: { open: "08:00", close: "16:00" },
  saturday: null,
  sunday: null,
};

export default function SupplierManagement({ user }: SupplierManagementProps) {
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SupplierData>({
    name: "",
    contactInfo: { phone: "", email: "" },
    operatingInfo: DEFAULT_OPERATING_INFO,
    geojson: { type: "Point", coordinates: [0, 0] },
  });

  const fetchUserSupplier = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/by-user/${user.id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSupplier(data);
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to fetch supplier:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserSupplier();
  }, [fetchUserSupplier]);

  const handleInputChange = (field: string, value: string | number) => {
    if (error) {
      setError(null);
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (
    section: "contactInfo" | "geojson",
    field: string,
    value: string | number,
  ) => {
    if (error) {
      setError(null);
    }
    setFormData((prev) => {
      if (section === "contactInfo") {
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [field]: value,
          },
        };
      } else if (section === "geojson") {
        if (field === "lat") {
          return {
            ...prev,
            geojson: {
              ...prev.geojson,
              coordinates: [prev.geojson.coordinates[0], value as number],
            },
          };
        } else if (field === "lng") {
          return {
            ...prev,
            geojson: {
              ...prev.geojson,
              coordinates: [value as number, prev.geojson.coordinates[1]],
            },
          };
        }
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validated = supplierFormSchema.safeParse({
      name: formData.name,
      contactInfo: formData.contactInfo,
      coordinates: {
        lat: formData.geojson.coordinates[1],
        lng: formData.geojson.coordinates[0],
      },
      operatingInfo: formData.operatingInfo,
    });

    if (!validated.success) {
      setError(
        validated.error.issues[0]?.message || "Please check the form values.",
      );
      return;
    }

    try {
      setIsLoading(true);

      const method = supplier ? "PUT" : "POST";
      const url = supplier
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${supplier.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(toSupplierPayload(validated.data)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save supplier");
      }

      const savedData = await response.json();
      setSupplier(savedData);
      setIsEditing(false);
      setSuccess(
        supplier
          ? "Supplier updated successfully"
          : "Supplier created successfully",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!supplier && !isEditing) {
    return (
      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Supplier Details
        </h2>
        <p className="text-slate-600 mb-4">
          You don&apos;t have a supplier profile yet. Create one to start listing
          your products and services.
        </p>
        <Button
          onClick={() => {
            setIsEditing(true);
            setFormData({
              name: "",
              contactInfo: { phone: "", email: "" },
              operatingInfo: DEFAULT_OPERATING_INFO,
              geojson: { type: "Point", coordinates: [0, 0] },
            });
          }}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded"
        >
          Create Supplier Profile
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-2 border-slate-800 rounded-lg p-6 space-y-4">
        {supplier ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {supplier.name}
                </h2>
                {supplier.contactInfo.phone && (
                  <p className="text-sm text-slate-600">
                    Phone: {supplier.contactInfo.phone}
                  </p>
                )}
                {supplier.contactInfo.email && (
                  <p className="text-sm text-slate-600">
                    Email: {supplier.contactInfo.email}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded"
              >
                Edit
              </Button>
            </div>

            {success && (
              <Alert className="bg-green-50 border-green-500">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : null}
      </div>

      {isEditing && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-slate-800">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b-2 border-slate-800">
              <h2 className="text-2xl font-bold text-slate-800">
                {supplier ? "Edit" : "Create"} Supplier Profile
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-slate-100 rounded"
                disabled={isLoading}
              >
                <X className="w-6 h-6 text-slate-800" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Supplier Name
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-800 rounded text-slate-800"
                    required
                  />
                </div>

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
                    className="w-full px-3 py-2 bg-white border-2 border-slate-800 rounded text-slate-800"
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
                    className="w-full px-3 py-2 bg-white border-2 border-slate-800 rounded text-slate-800"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Latitude
                  </Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.geojson.coordinates[1]}
                    onChange={(e) =>
                      handleNestedChange(
                        "geojson",
                        "lat",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-800 rounded text-slate-800"
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
                    value={formData.geojson.coordinates[0]}
                    onChange={(e) =>
                      handleNestedChange(
                        "geojson",
                        "lng",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-800 rounded text-slate-800"
                    required
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Operating Hours
                  </h3>
                  <OpeningHoursForm
                    value={formData.operatingInfo}
                    onChange={(hours) => {
                      setFormData((prev) => ({
                        ...prev,
                        operatingInfo: hours,
                      }));
                      if (error) {
                        setError(null);
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
                  >
                    {isLoading
                      ? "Saving..."
                      : supplier
                        ? "Update Supplier"
                        : "Create Supplier"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 border-slate-800 text-slate-800 hover:bg-slate-100 font-bold py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
