"use client";

import { DeliveryOrder } from "@shared/index";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, MapPin, Clock, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getOpenDeliveries,
  getMyDeliveries,
  acceptDelivery,
} from "@/lib/api-client";

export default function DeliveriesScreen() {
  const [activeTab, setActiveTab] = useState<"open" | "mine">("open");
  const [openOrders, setOpenOrders] = useState<DeliveryOrder[]>([]);
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [open, mine] = await Promise.all([
        getOpenDeliveries(),
        getMyDeliveries(),
      ]);
      setOpenOrders(open);
      setMyOrders(mine);
    } catch (err) {
      console.error(err);
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (activityId: string) => {
    try {
      setAcceptingId(activityId);
      await acceptDelivery(activityId);
      await fetchData();
      setActiveTab("mine");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept delivery");
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      requested: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const displayedOrders = activeTab === "open" ? openOrders : myOrders;

  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4 items-center justify-center">
        <p className="text-slate-600">Loading deliveries...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Deliveries
          </h1>
          <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setActiveTab("open")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "open"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Open Deliveries
          {openOrders.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {openOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "mine"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Your Deliveries
          {myOrders.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {myOrders.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center justify-start flex-1">
        {displayedOrders.length === 0 ? (
          <div className="w-full max-w-sm text-center py-12">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-50">
                {activeTab === "open" ? (
                  <Truck className="w-12 h-12 text-slate-400" />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {activeTab === "open"
                ? "No Open Deliveries"
                : "No Deliveries Yet"}
            </h2>
            <p className="text-slate-600 mb-8">
              {activeTab === "open"
                ? "There are no unassigned deliveries available right now. Check back later!"
                : "You haven't accepted any deliveries yet. Check the Open Deliveries tab to find available orders."}
            </p>

            {activeTab === "mine" && (
              <Button
                onClick={() => setActiveTab("open")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg"
              >
                View Open Deliveries
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-4">
            {displayedOrders.map((delivery, index) => (
              <div
                key={delivery.activity.id}
                className="bg-white border-2 border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-800">
                    Delivery #{index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(delivery.activity.status)}
                  </div>
                </div>

                {delivery.provider && (
                  <p className="text-sm text-slate-500 mb-3">
                    From:{" "}
                    <span className="font-medium text-slate-700">
                      {delivery.provider.firstName}{" "}
                      {delivery.provider.lastName}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-sm">{delivery.activity.location}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <p className="text-sm">
                    {formatDate(delivery.activity.orderTime)} at{" "}
                    {formatTime(delivery.activity.orderTime)}
                  </p>
                </div>

                {delivery.activity.notes && (
                  <p className="text-sm text-slate-600 mt-2 italic">
                    &ldquo;{delivery.activity.notes}&rdquo;
                  </p>
                )}

                <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200">
                  {activeTab === "open" ? (
                    <Button
                      onClick={() => handleAccept(delivery.activity.id)}
                      disabled={acceptingId === delivery.activity.id}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg"
                    >
                      {acceptingId === delivery.activity.id
                        ? "Accepting..."
                        : "Accept Delivery"}
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-800 text-slate-800 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedOrderId === delivery.activity.id
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                      Details
                    </button>
                  )}
                </div>

                {expandedOrderId === delivery.activity.id &&
                  activeTab === "mine" && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Status:</span>{" "}
                        {delivery.activity.status.replace("_", " ")}
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(delivery.activity.createdAt)}
                      </div>
                      {delivery.activity.details && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Type:</span>{" "}
                          {(delivery.activity.details as Record<string, unknown>).orderType ===
                          "repeated"
                            ? "Recurring"
                            : "One-time"}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
