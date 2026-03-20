"use client";

import { DeliveryOrder } from "@shared/index";
import { DistributionCenter } from "@shared/index";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Truck,
  icons,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOpenDeliveries,
  getMyDeliveries,
  acceptDelivery,
  startDelivery,
  completeDelivery,
  getAssistanceRequests,
  acceptAssistance,
} from "@/lib/api-client";
import { getDistributionCenters } from "@/lib/api-distro";
import { sendCompletionMessage } from "@/lib/api-chat";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import DeliveryCard from "./DeliveryCard";
import SortableDeliveryCard from "./SortableDeliveryCard";

// TODO: General dashboard (open / in progress orders) (admin, managers and drivers) dashboard drivers and map.

export default function DeliveriesScreen() {
  const [activeTab, setActiveTab] = useState<"open" | "mine" | "assistance">(
    "open",
  );
  const [openOrders, setOpenOrders] = useState<DeliveryOrder[]>([]);
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);
  const [assistanceRequests, setAssistanceRequests] = useState<DeliveryOrder[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [expandedOpenOrderId, setExpandedOpenOrderId] = useState<string | null>(
    null,
  );
  const [expandedMyOrderId, setExpandedMyOrderId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [centers, setCenters] = useState<DistributionCenter[]>([]);
  const [filterCenter, setFilterCenter] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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
      const [open, mine, assisted, distros] = await Promise.all([
        getOpenDeliveries(),
        getMyDeliveries(),
        getAssistanceRequests().catch(() => []),
        getDistributionCenters().catch(() => []),
      ]);
      setOpenOrders(open);
      setMyOrders(applySavedOrder(mine));
      setAssistanceRequests(assisted);
      setCenters(distros);
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

  const handleComplete = async (
    activityId: string,
    completionStatus: "completed" | "incomplete" | "need_assistance",
    completionData?: Record<string, unknown>,
  ) => {
    try {
      setCompletingId(activityId);
      await completeDelivery(activityId, completionStatus, completionData);

      // Send automated message to the supplier channel
      try {
        await sendCompletionMessage(
          activityId,
          completionStatus,
          completionData,
        );
      } catch (err) {
        console.error("Failed to send completion message:", err);
      }

      await fetchData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to complete delivery",
      );
    } finally {
      setCompletingId(null);
    }
  };

  const handleAcceptAssistance = async (activityId: string) => {
    try {
      setAcceptingId(activityId);
      await acceptAssistance(activityId);
      await fetchData();
      setActiveTab("mine");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to accept assistance",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStart = async (activityId: string) => {
    try {
      setStartingId(activityId);
      await startDelivery(activityId);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start delivery");
    } finally {
      setStartingId(null);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const deliveryDays = useMemo(() => {
    const source = activeTab === "open" ? openOrders : myOrders;
    const counts = new Map<string, number>();
    source.forEach((d) => {
      const day = new Date(d.activity.orderTime).toISOString().split("T")[0];
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return counts;
  }, [openOrders, myOrders, activeTab]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calendarMonth]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    const source =
      activeTab === "open"
        ? openOrders
        : activeTab === "mine"
          ? myOrders
          : assistanceRequests;
    return source.filter((d) => {
      if (filterCenter !== "all" && d.center?.id !== filterCenter) return false;
      if (filterDay !== "all") {
        const orderDay = new Date(d.activity.orderTime)
          .toISOString()
          .split("T")[0];
        if (orderDay !== filterDay) return false;
      }
      return true;
    });
  }, [
    activeTab,
    openOrders,
    myOrders,
    assistanceRequests,
    filterCenter,
    filterDay,
  ]);

  const displayedOrders = filteredOrders;

  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)] lg:min-h-screen bg-amber-50 p-4">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Deliveries
            </h1>
            <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600 w-40 mx-auto rounded-full"></div>
          </div>
        </div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] lg:min-h-screen bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Deliveries</h1>
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600 w-40 mx-auto rounded-full"></div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 justify-center flex-wrap">
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
        <button
          onClick={() => setActiveTab("assistance")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "assistance"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Help Requests
          {assistanceRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {assistanceRequests.length}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium mb-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {(filterCenter !== "all" || filterDay !== "all") && (
            <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {(filterCenter !== "all" ? 1 : 0) + (filterDay !== "all" ? 1 : 0)}
            </span>
          )}
        </button>
        {showFilters && (
          <div className="flex flex-wrap gap-3 bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Distribution Center
              </label>
              <Select value={filterCenter} onValueChange={setFilterCenter}>
                <SelectTrigger className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                  <SelectValue placeholder="All Centers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filterCenter !== "all" || filterDay !== "all") && (
              <button
                onClick={() => {
                  setFilterCenter("all");
                  setFilterDay("all");
                }}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium"
              >
                Clear filters
              </button>
            )}

            <div className="w-full mt-1">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  {calendarMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-medium text-slate-400 py-1"
                  >
                    {d}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`e-${i}`} />;
                  const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const count = deliveryDays.get(dateStr) || 0;
                  const isSelected = filterDay === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setFilterDay(isSelected ? "all" : dateStr)}
                      className={`relative text-xs py-1.5 rounded transition-colors ${
                        isSelected
                          ? "bg-orange-500 text-white font-bold"
                          : count > 0
                            ? "text-slate-800 font-medium hover:bg-orange-50"
                            : "text-slate-300"
                      }`}
                    >
                      {day}
                      {count > 0 && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
                : activeTab === "mine"
                  ? "No Deliveries Yet"
                  : "No Help Requests"}
            </h2>
            <p className="text-slate-600 mb-8">
              {activeTab === "open"
                ? "There are no unassigned deliveries available right now. Check back later!"
                : activeTab === "mine"
                  ? "You haven't accepted any deliveries yet. Check the Open Deliveries tab to find available orders."
                  : "There are no deliveries needing additional help right now."}
            </p>

            {activeTab === "mine" && (
              <Button
                onClick={() => setActiveTab("open")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg"
              >
                View Open Deliveries
              </Button>
            )}
            {activeTab === "assistance" && (
              <Button
                onClick={() => setActiveTab("open")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg"
              >
                View Open Deliveries
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            {activeTab === "mine" ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayedOrders.map((d) => d.activity.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayedOrders.map((delivery) => (
                      <SortableDeliveryCard
                        key={delivery.activity.id}
                        delivery={delivery}
                        expandedOrderId={expandedMyOrderId}
                        setExpandedOrderId={setExpandedMyOrderId}
                        formatTime={formatTime}
                        formatDate={formatDate}
                        getVehicleIcon={getVehicleIcon}
                        completingId={completingId}
                        handleComplete={handleComplete}
                        startingId={startingId}
                        handleStart={handleStart}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : activeTab === "assistance" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayedOrders.map((delivery) => (
                  <div
                    key={delivery.activity.id}
                    className="bg-white rounded-lg border-2 border-red-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {delivery.provider?.firstName}{" "}
                          {delivery.provider?.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {formatDate(delivery.activity.orderTime)} at{" "}
                          {formatTime(delivery.activity.orderTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(delivery.vehicle?.icon)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Location:</span>{" "}
                        {delivery.activity.location}
                      </p>
                      {delivery.center && (
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Center:</span>{" "}
                          {delivery.center.name}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleAcceptAssistance(delivery.activity.id)
                      }
                      disabled={acceptingId === delivery.activity.id}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {acceptingId === delivery.activity.id
                        ? "Accepting..."
                        : "Accept Help"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayedOrders.map((delivery) => (
                  <DeliveryCard
                    key={delivery.activity.id}
                    delivery={delivery}
                    expandedOrderId={expandedOpenOrderId}
                    setExpandedOrderId={setExpandedOpenOrderId}
                    acceptingId={acceptingId}
                    handleAccept={handleAccept}
                    formatTime={formatTime}
                    formatDate={formatDate}
                    getVehicleIcon={getVehicleIcon}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
