"use client";

import { DeliveryOrder } from "@shared/index";
import { Button } from "@/components/ui/button";
import { FileText, Truck, icons } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getOpenDeliveries,
  getMyDeliveries,
  acceptDelivery,
  completeDelivery,
} from "@/lib/api-client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DeliveryCard from "./DeliveryCard";
import SortableDeliveryCard from "./SortableDeliveryCard";

export default function DeliveriesScreen() {
  const [activeTab, setActiveTab] = useState<"open" | "mine">("open");
  const [openOrders, setOpenOrders] = useState<DeliveryOrder[]>([]);
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const STORAGE_KEY = "delivery-order";

  const applySavedOrder = useCallback((deliveries: DeliveryOrder[]) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return deliveries;
      const savedIds: string[] = JSON.parse(saved);
      const map = new Map(deliveries.map((d) => [d.activity.id, d]));
      const ordered: DeliveryOrder[] = [];
      for (const id of savedIds) {
        const item = map.get(id);
        if (item) {
          ordered.push(item);
          map.delete(id);
        }
      }
      for (const item of map.values()) {
        ordered.push(item);
      }
      return ordered;
    } catch {
      return deliveries;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [open, mine] = await Promise.all([
        getOpenDeliveries(),
        getMyDeliveries(),
      ]);
      setOpenOrders(open);
      setMyOrders(applySavedOrder(mine));
    } catch (err) {
      console.error(err);
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, [applySavedOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (activityId: string) => {
    try {
      setAcceptingId(activityId);
      await acceptDelivery(activityId);
      await fetchData();
      setActiveTab("mine");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to accept delivery",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleComplete = async (activityId: string) => {
    try {
      setCompletingId(activityId);
      await completeDelivery(activityId);
      await fetchData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to complete delivery",
      );
    } finally {
      setCompletingId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVehicleIcon = (iconName?: string | null) => {
    const IconComponent = iconName
      ? icons[iconName as keyof typeof icons]
      : null;
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-slate-600" />;
    }
    return <Truck className="w-5 h-5 text-slate-600" />;
  };

  // DnD Sensors prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setMyOrders((prev) => {
      const oldIndex = prev.findIndex((d) => d.activity.id === active.id);
      const newIndex = prev.findIndex((d) => d.activity.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reordered.map((d) => d.activity.id)),
      );
      return reordered;
    });
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
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Deliveries</h1>
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
            {activeTab === "mine" ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={myOrders.map((d) => d.activity.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {myOrders.map((delivery) => (
                    <SortableDeliveryCard
                      key={delivery.activity.id}
                      delivery={delivery}
                      expandedOrderId={expandedOrderId}
                      setExpandedOrderId={setExpandedOrderId}
                      formatTime={formatTime}
                      getVehicleIcon={getVehicleIcon}
                      completingId={completingId}
                      handleComplete={handleComplete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              displayedOrders.map((delivery) => (
                <DeliveryCard
                  key={delivery.activity.id}
                  delivery={delivery}
                  expandedOrderId={expandedOrderId}
                  setExpandedOrderId={setExpandedOrderId}
                  acceptingId={acceptingId}
                  handleAccept={handleAccept}
                  formatTime={formatTime}
                  getVehicleIcon={getVehicleIcon}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
