"use client";

import { User, Order } from "@shared/index";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading";
import {
  FileText,
  ChevronDown,
  MessageCircle,
  Copy,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProviderOrders } from "@/lib/api-client";

export default function OrdersScreen(_props: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getProviderOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
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

  const templateOrders = completedOrders;

  const displayedOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "completed"
        ? completedOrders
        : templateOrders;

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
      <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Orders</h1>
            <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
          </div>
        </div>
        <CardSkeleton count={5} />
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

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6 justify-center flex-wrap">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "active"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Active orders
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "completed"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Recently completed
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "templates"
              ? "bg-[#2D3E2D] text-white"
              : "bg-white text-slate-800 border-2 border-slate-800"
          }`}
        >
          Templates
        </button>
      </div>

      <div className="flex flex-col items-center justify-start flex-1">
        {displayedOrders.length === 0 ? (
          <div className="w-full max-w-sm text-center py-12">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-50">
                {activeTab === "templates" ? (
                  <Copy className="w-12 h-12 text-slate-400" />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {activeTab === "active"
                ? "No Active Orders"
                : activeTab === "completed"
                  ? "No Completed Orders"
                  : "No Templates Available"}
            </h2>
            <p className="text-slate-600 mb-8">
              {activeTab === "active"
                ? "You haven't created any active orders yet. Start by creating your first order!"
                : activeTab === "completed"
                  ? "You don't have any completed orders yet."
                  : "Complete an order first, then you can use it as a template for recurring orders."}
            </p>

            {activeTab === "active" && (
              <Link href="/create-order" className="inline-block">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg">
                  <span className="mr-2">+</span>
                  Create Order
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            {activeTab !== "templates" && (
              <div className="flex justify-center mb-6">
                <Link href="/create-order" className="inline-block">
                  <Button className="bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-bold py-3 px-6 rounded-lg">
                    <span className="mr-2 text-xl">+</span>
                    Create new order
                  </Button>
                </Link>
              </div>
            )}

            {activeTab === "templates" && (
              <p className="text-center text-slate-600 mb-6">
                Copy a completed order to use as a template for a new recurring
                order.
              </p>
            )}

            <div className="space-y-4">
              {displayedOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        #{index + 1}
                      </h3>
                      {(order.weekly || order.monthly) && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          <CalendarClock className="w-3 h-3" />
                          {order.weekly ? "Weekly" : "Monthly"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatDate(order.orderTime)}
                    </p>
                  </div>

                  <p className="text-slate-800 font-semibold mb-4">
                    {order.activityType
                      ? order.activityType.charAt(0).toUpperCase() +
                        order.activityType.slice(1)
                      : "Delivery"}
                    {order.firstGoodCategory &&
                      ` · ${order.firstGoodCategory.charAt(0).toUpperCase() + order.firstGoodCategory.slice(1)}`}
                  </p>

                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <span className="text-lg">📍</span>
                    <p className="text-sm">{order.location}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                    {activeTab === "templates" ? (
                      <>
                        <Link
                          href={`/create-order?from=${order.id}`}
                          className="flex-1"
                        >
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" />
                            Use as Template
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/chatroom?thread=${order.id}`}>
                          <MessageCircle className="w-5 h-5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer" />
                        </Link>
                        <div className="flex-1" />
                        <button
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id,
                            )
                          }
                          className="p-0 bg-transparent border-none cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-slate-600 hover:text-slate-900 transition-all ${
                              expandedOrderId === order.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </>
                    )}
                  </div>

                  {expandedOrderId === order.id &&
                    activeTab !== "templates" && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-slate-500">Pickup time</p>
                            <p className="text-slate-800 font-medium">
                              {new Date(order.orderTime).toLocaleString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">
                              Distribution center
                            </p>
                            <p className="text-slate-800 font-medium">
                              {order.centerName ?? "Not assigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Status</p>
                            <p className="text-slate-800 font-medium capitalize">
                              {order.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Items</p>
                            <p className="text-slate-800 font-medium">
                              {order.goodsCount}
                            </p>
                          </div>
                        </div>
                        {order.status !== "completed" && (
                          <Link
                            href={`/edit-order/${order.id}`}
                            className="block"
                          >
                            <Button className="w-full bg-[#2D3E2D] hover:bg-[#1D2E1D] text-white font-bold py-3 rounded">
                              Edit Order
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
