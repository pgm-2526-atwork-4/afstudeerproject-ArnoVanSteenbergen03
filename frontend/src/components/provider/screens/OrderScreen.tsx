"use client";

import { User, Order } from "@shared/index";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProviderOrders } from "@/lib/api-client";

export default function OrdersScreen({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getProviderOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrders = orders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const displayedOrders =
    activeTab === "active" ? activeOrders : completedOrders;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4 items-center justify-center">
        <p className="text-slate-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Orders</h1>
          <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "active"
              ? "bg-slate-800 text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Active orders
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "completed"
              ? "bg-slate-800 text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Recently completed
        </button>
      </div>

      <div className="flex flex-col items-center justify-start flex-1">
        {displayedOrders.length === 0 ? (
          <div className="w-full max-w-sm text-center py-12">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-50">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {activeTab === "active"
                ? "No Active Orders"
                : "No Completed Orders"}
            </h2>
            <p className="text-slate-600 mb-8">
              {activeTab === "active"
                ? "You haven't created any active orders yet. Start by creating your first order!"
                : "You don't have any completed orders yet."}
            </p>

            {activeTab === "active" && (
              <Link href="/provider/create-order" className="inline-block">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg">
                  <span className="mr-2">+</span>
                  Create Order
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="flex justify-center mb-6">
              <Link href="/provider/create-order" className="inline-block">
                <Button className="bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-bold py-3 px-6 rounded-lg">
                  <span className="mr-2 text-xl">+</span>
                  Create new order
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {displayedOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-lg font-bold text-slate-800">
                        #{index + 1}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {formatDate(order.pickupTime)}
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  </div>

                  <p className="text-slate-800 font-semibold mb-3">
                    {order.details?.orderType === "repeated"
                      ? "Recurring Order"
                      : "Food Delivery"}{" "}
                    {order.notes && `- ${order.notes}`}
                  </p>

                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-lg">📍</span>
                    <p className="text-sm">
                      {order.pickupAddress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
