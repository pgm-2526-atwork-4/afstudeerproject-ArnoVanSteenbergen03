"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { getVehicles } from "@/lib/api-client";

interface Vehicle {
  id: string;
  vehicleType: string;
  icon: string;
  amount: number;
}

interface DeliveryStepProps {
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (
    pickupAddress: string,
    vehicleId: string,
    deliveryNotes: string,
    pickupTime: string,
  ) => void;
  submitting: boolean;
  error: string | null;
  initialPickupAddress?: string;
  initialVehicleId?: string;
  initialNotes?: string;
  initialPickupTime?: string;
  isEditing?: boolean;
}

export default function DeliveryStep({
  onBack,
  onCancel,
  onSubmit,
  submitting,
  error,
  initialPickupAddress = "",
  initialVehicleId = "",
  initialNotes = "",
  initialPickupTime = "",
  isEditing = false,
}: DeliveryStepProps) {
  const [pickupAddress, setPickupAddress] = useState(initialPickupAddress);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(initialVehicleId);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(initialNotes);
  const [pickupTime, setPickupTime] = useState(initialPickupTime);
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

  const getIconComponent = (iconName: string) => {
    type IconName = keyof typeof LucideIcons;
    const icons = LucideIcons as Record<string, any>;
    return icons[iconName] || icons["Package"];
  };

  const handleFinishOrder = () => {
    if (!pickupAddress.trim()) {
      setValidationError("Please enter a pickup address.");
      return;
    }
    if (!selectedVehicle) {
      setValidationError("Please select a vehicle type.");
      return;
    }
    if (!pickupTime) {
      setValidationError("Please select a pickup time.");
      return;
    }
    setValidationError(null);

    const pickupDateTime = new Date(pickupTime).toISOString();
    onSubmit(pickupAddress, selectedVehicle, notes, pickupDateTime);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-800 hover:text-slate-600 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Pick Up Address
        </Label>
        <Input
          type="text"
          placeholder="e.g., 123 Main St, Downtown"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          className="w-full px-3 py-2 border-2 border-slate-800 rounded"
        />
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Pickup Date & Time
        </Label>
        <Input
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          className="w-full px-3 py-2 border-2 border-slate-800 rounded"
        />
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Select vehicle type
        </Label>
        {loading ? (
          <p className="text-slate-600">Loading vehicles...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const IconComponent = getIconComponent(vehicle.icon);
              const isSelected = selectedVehicle === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg transition ${
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Extra notes about the Delivery
        </Label>
        <textarea
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
            ? (isEditing ? "Updating Order..." : "Creating Order...")
            : (isEditing ? "Update Order" : "Finish Order")
          }
        </Button>
      </div>
    </div>
  );
}
