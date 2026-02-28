"use client";

import { Button } from "@/components/ui/button";
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
}

export default function DeliveryStep({ onBack, onCancel }: DeliveryStepProps) {
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [repeatDelivery, setRepeatDelivery] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

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
          Pick Up address
        </Label>
        <select
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white"
        >
          <option value="">Enter address</option>
          <option value="address1">Distribution Center 1</option>
          <option value="address2">Distribution Center 2</option>
        </select>
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
                    <p className="text-xs text-slate-500">({vehicle.amount} available)</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Extra Notes */}
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

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="px-4 py-3"
        >
          Cancel Order
        </Button>
        <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3">
          Finish Order
        </Button>
      </div>
    </div>
  );
}
