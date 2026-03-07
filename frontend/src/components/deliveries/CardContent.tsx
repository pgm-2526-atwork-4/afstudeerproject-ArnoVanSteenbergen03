import { useState } from "react";
import { DeliveryOrder } from "@shared/index";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CardProps {
  delivery: DeliveryOrder;
  expandedOrderId: string | null;
  setExpandedOrderId: (id: string | null) => void;
  formatTime: (d: string) => string;
  getVehicleIcon: (icon?: string | null) => React.ReactNode;
  completingId?: string | null;
  handleComplete?: (id: string) => void;
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
  completingId,
  handleComplete,
}: CardProps & {
  acceptingId?: string | null;
  handleAccept?: (id: string) => void;
  isOpen?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isCompleting = completingId === delivery.activity.id;
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

          {delivery.activity.notes && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">Delivery notes:</span> &ldquo;
              {delivery.activity.notes}&rdquo;
            </div>
          )}

          {handleComplete && delivery.activity.status !== "completed" && (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={isCompleting}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              {isCompleting ? "Completing..." : "Complete Order"}
            </Button>
          )}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete this delivery?</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this delivery as completed? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setConfirmOpen(false);
                handleComplete?.(delivery.activity.id);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
