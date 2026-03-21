"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getVehicles } from "@/lib/api-client";
import type { Vehicle } from "@shared/index";
import { z } from "zod/v4";


const deliveryStepSchema = z.object({
  location: z.string().trim().min(1, "Please enter a location."),
  vehicleId: z.string().trim().min(1, "Please select a vehicle type."),
});

const orderTimeSchema = z
  .string()
  .min(1, "Please select an order time.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Please select a valid order time.",
  });

interface DeliveryStepProps {
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (
    location: string,
    vehicleId: string,
    deliveryNotes: string,
    orderTime: string,
  ) => void;
  submitting: boolean;
  error: string | null;
  initialLocation?: string;
  initialVehicleId?: string;
  initialNotes?: string;
  initialOrderTime?: string;
  isEditing?: boolean;
  hideDateTime?: boolean;
}

export default function DeliveryStep({
  onBack,
  onCancel,
  onSubmit,
  submitting,
  error,
  initialLocation = "",
  initialVehicleId = "",
  initialNotes = "",
  initialOrderTime = "",
  isEditing = false,
  hideDateTime = false,
}: DeliveryStepProps) {
  const [location, setLocation] = useState(initialLocation);
  const [selectedVehicle, setSelectedVehicle] =
    useState<string>(initialVehicleId);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(initialNotes);
  const [orderTime, setOrderTime] = useState(initialOrderTime);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = LucideIcons as unknown as Record<
      string,
      LucideIcon
    >;
    return icons[iconName] || LucideIcons.Package;
  };

  const handleFinishOrder = () => {
    const validated = deliveryStepSchema.safeParse({
      location,
      vehicleId: selectedVehicle,
    });

    if (!validated.success) {
      setValidationError(
        validated.error.issues[0]?.message || "Please check the form values.",
      );
      return;
    }

    if (!hideDateTime) {
      const orderTimeValidated = orderTimeSchema.safeParse(orderTime);
      if (!orderTimeValidated.success) {
        setValidationError(
          orderTimeValidated.error.issues[0]?.message ||
            "Please select a valid order time.",
        );
        return;
      }
    }

    const orderDate = hideDateTime ? new Date() : new Date(orderTime);
    if (Number.isNaN(orderDate.getTime())) {
      setValidationError("Please select a valid order time.");
      return;
    }

    setValidationError(null);

    onSubmit(
      validated.data.location,
      validated.data.vehicleId,
      notes,
      orderDate.toISOString(),
    );
  };

  return (
    <div className="space-y-6">
      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        className="flex items-center gap-2 text-slate-800 hover:text-slate-600 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Button>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Location
        </Label>
        <Input
          type="text"
          placeholder="e.g., 123 Main St, Downtown"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          className="w-full px-3 py-2 border-2 border-slate-800 rounded"
        />
      </div>

      {!hideDateTime && (
        <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
          <Label className="block text-sm font-semibold text-slate-800 mb-4">
            Order Date & Time
          </Label>
          <Input
            type="datetime-local"
            value={orderTime}
            onChange={(e) => {
              setOrderTime(e.target.value);
              if (validationError) {
                setValidationError(null);
              }
            }}
            className="w-full px-3 py-2 border-2 border-slate-800 rounded"
          />
        </div>
      )}

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Select vehicle type
        </Label>
        {loading ? (
          <p className="text-slate-600">Loading vehicles...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const IconComponent = getIconComponent(vehicle.icon);
              const isSelected = selectedVehicle === vehicle.id;
              return (
                <Button
                  type="button"
                  key={vehicle.id}
                  onClick={() => {
                    setSelectedVehicle(vehicle.id);
                    if (validationError) {
                      setValidationError(null);
                    }
                  }}
                  variant="outline"
                  className={`h-auto min-h-24 flex flex-col items-center justify-center gap-2 px-3 py-4 whitespace-normal border-2 rounded-lg transition ${
                    isSelected
                      ? "border-orange-600 bg-orange-50"
                      : "border-slate-300 hover:border-slate-800"
                  }`}
                >
                  <IconComponent className="w-8 h-8 text-slate-800" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800 capitalize">
                      {vehicle.vehicleType}
                    </p>
                    <p className="text-xs text-slate-500">
                      ({vehicle.amount} available)
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Extra notes about the Delivery
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional information about the delivery..."
          className="w-full px-3 py-2 border-2 border-slate-800 rounded resize-none min-h-[150px]"
        />
      </div>

      {(validationError || error) && (
        <p className="text-red-600 text-sm text-center">
          {validationError || error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="px-4 py-3"
          disabled={submitting}
        >
          Cancel Order
        </Button>
        <Button
          onClick={handleFinishOrder}
          disabled={submitting}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
        >
          {submitting
            ? isEditing
              ? "Updating Order..."
              : "Creating Order..."
            : isEditing
              ? "Update Order"
              : "Finish Order"}
        </Button>
      </div>
    </div>
  );
}
