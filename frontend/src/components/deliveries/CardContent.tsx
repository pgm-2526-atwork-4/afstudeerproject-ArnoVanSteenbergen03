import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeliveryOrder } from "@shared/index";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  MapPin,
  Clock,
  Calendar,
  MessageSquare,
} from "lucide-react";
import CompletionModal from "./CompletionModal";
import ProblemModal from "./ProblemModal";

// A single delivery card content component

export interface CardProps {
  delivery: DeliveryOrder;
  expandedOrderId: string | null;
  setExpandedOrderId: (id: string | null) => void;
  formatTime: (d: string) => string;
  formatDate: (d: string) => string;
  getVehicleIcon: (icon?: string | null) => React.ReactNode;
  completingId?: string | null;
  handleComplete?: (
    id: string,
    status: "completed" | "incomplete" | "need_assistance",
    data?: Record<string, unknown>,
  ) => void;
  startingId?: string | null;
  handleStart?: (id: string) => void;
}

export default function CardContent({
  delivery,
  expandedOrderId,
  setExpandedOrderId,
  formatTime,
  formatDate,
  getVehicleIcon,
  acceptingId,
  handleAccept,
  isOpen,
  completingId,
  handleComplete,
  startingId,
  handleStart,
}: CardProps & {
  acceptingId?: string | null;
  handleAccept?: (id: string) => void;
  isOpen?: boolean;
}) {
  const [completionOpen, setCompletionOpen] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const router = useRouter();
  const isCompleting = completingId === delivery.activity.id;
  const isStarting = startingId === delivery.activity.id;
  const status = delivery.activity.status;

  const handleChatClick = () => {
    if (delivery.supplierChannel) {
      //auto scrolls to order post in the supplier channel
      router.push(
        `/chatroom?channel=${delivery.supplierChannel.id}&activity=${delivery.activity.id}`,
      );
    }
  };

  const getStatusBadge = () => {
    const map: Record<string, { label: string; color: string }> = {
      accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800" },
      in_progress: {
        label: "In Progress",
        color: "bg-yellow-100 text-yellow-800",
      },
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
      incomplete: {
        label: "Incomplete",
        color: "bg-orange-100 text-orange-800",
      },
      need_assistance: {
        label: "Needs Assistance",
        color: "bg-red-100 text-red-800",
      },
    };
    const info = map[status];
    if (!info) return null;
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}
      >
        {info.label}
      </span>
    );
  };

  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Pickup</p>
            <p className="text-sm font-semibold text-slate-800">
              {delivery.activity.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {formatDate(delivery.activity.orderTime)}
          </span>
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

        {delivery.supplierChannel ? (
          <button
            onClick={handleChatClick}
            className="p-0 bg-transparent border-none cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-slate-600 hover:text-slate-900 transition-colors" />
          </button>
        ) : (
          <div className="w-5 h-5" />
        )}

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
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Status:</span>
            {getStatusBadge()}
          </div>

          {delivery.activity.notes && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">Delivery notes:</span> &ldquo;
              {delivery.activity.notes}&rdquo;
            </div>
          )}

          {handleStart && status === "accepted" && (
            <Button
              onClick={() => handleStart(delivery.activity.id)}
              disabled={isStarting}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              {isStarting ? "Starting..." : "Start Delivery"}
            </Button>
          )}

          {handleComplete && status === "in_progress" && (
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => setCompletionOpen(true)}
                disabled={isCompleting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm"
              >
                {isCompleting ? "Processing..." : "Complete Order"}
              </Button>
              <Button
                onClick={() => setProblemOpen(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm"
              >
                Problem?
              </Button>
            </div>
          )}
        </div>
      )}

      {handleComplete && (
        <>
          <CompletionModal
            open={completionOpen}
            onOpenChange={setCompletionOpen}
            submitting={isCompleting}
            onSubmit={(completionStatus, data) => {
              handleComplete(delivery.activity.id, completionStatus, data);
              setCompletionOpen(false);
            }}
          />
          <ProblemModal
            open={problemOpen}
            onOpenChange={setProblemOpen}
            submitting={isCompleting}
            onSubmit={(data) => {
              handleComplete(delivery.activity.id, "need_assistance", data);
              setProblemOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}
