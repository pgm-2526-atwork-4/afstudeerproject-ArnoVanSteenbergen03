import { DeliveryOrder } from "@shared/index";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Clock } from "lucide-react";

export interface CardProps {
  delivery: DeliveryOrder;
  expandedOrderId: string | null;
  setExpandedOrderId: (id: string | null) => void;
  formatTime: (d: string) => string;
  getVehicleIcon: (icon?: string | null) => React.ReactNode;
}

export default function CardContent({
  delivery,
  expandedOrderId,
  setExpandedOrderId,
  formatTime,
  getVehicleIcon,
  acceptingId,
  handleAccept,
  isOpen,
}: CardProps & {
  acceptingId?: string | null;
  handleAccept?: (id: string) => void;
  isOpen?: boolean;
}) {
  return (
    <>
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-500">Pickup</p>
          <p className="text-sm font-semibold text-slate-800">
            {delivery.activity.location}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-500">Delivery</p>
          <p className="text-sm font-semibold text-slate-800">
            {delivery.center?.name ?? "Not assigned"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
        {getVehicleIcon(delivery.vehicle?.icon)}
        <span className="text-xs text-slate-500">
          {delivery.vehicle?.vehicleType ?? "vehicle"}
        </span>

        <div className="flex-1" />

        {isOpen && handleAccept ? (
          <Button
            onClick={() => handleAccept(delivery.activity.id)}
            disabled={acceptingId === delivery.activity.id}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-lg text-sm"
          >
            {acceptingId === delivery.activity.id ? "Accepting..." : "Accept"}
          </Button>
        ) : (
          <button
            onClick={() =>
              setExpandedOrderId(
                expandedOrderId === delivery.activity.id
                  ? null
                  : delivery.activity.id,
              )
            }
            className="p-0 bg-transparent border-none cursor-pointer"
          >
            <ChevronDown
              className={`w-5 h-5 text-slate-600 hover:text-slate-900 transition-all ${
                expandedOrderId === delivery.activity.id ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-500 mt-2">
        <Clock className="w-4 h-4" />
        <p className="text-xs">{formatTime(delivery.activity.orderTime)}</p>
      </div>

      {expandedOrderId === delivery.activity.id && !isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Status:</span>{" "}
            {delivery.activity.status.replace("_", " ")}
          </div>
          {delivery.provider && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">From:</span>{" "}
              {delivery.provider.firstName} {delivery.provider.lastName}
            </div>
          )}
          {delivery.activity.notes && (
            <div className="text-sm text-slate-600 italic">
              &ldquo;{delivery.activity.notes}&rdquo;
            </div>
          )}
        </div>
      )}
    </>
  );
}
