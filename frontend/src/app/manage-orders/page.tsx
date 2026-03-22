"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminOrders,
  getDistributionCenters,
  type AdminOrderRow,
} from "@/lib/api-client";
import type { DistributionCenter } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/loading";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Filter,
  Pencil,
} from "lucide-react";

const STATUSES = [
  "requested",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];
const PAGE_SIZE = 10;
const ALL_CENTERS = "__all_centers__";
const ALL_STATUSES = "__all_statuses__";

export default function ManageOrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [centerId, setCenterId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [centers, setCenters] = useState<
    Array<Pick<DistributionCenter, "id" | "name">>
  >([]);

  useEffect(() => {
    getDistributionCenters()
      .then((data) => setCenters(data.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, []);

  const buildParams = useCallback(
    (p: number) => ({
      page: p,
      limit: PAGE_SIZE,
      ...(status && { status }),
      ...(centerId && { centerId }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    }),
    [status, centerId, dateFrom, dateTo],
  );

  const fetchOrders = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminOrders(buildParams(p));
        setOrders(res.orders);
        setPage(p);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    fetchOrders(p);
  };

  if (!user) return null;

  const getStatusColor = (s: string) => {
    switch (s) {
      case "requested":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const formatStatus = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ProtectedPage requiredPermission="view_orders">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-6 lg:ml-20 relative z-10">
          <Link href="/dashboard">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Manage Orders</h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2" />
            <p className="text-sm text-slate-500 mt-2">
              {total} order{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="w-6" />
        </div>

        <div className="max-w-5xl mx-auto w-full">
          <div className="bg-white border-2 border-[#2D3E2D] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                Filters
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Distribution Center
                </label>
                <Select
                  value={centerId || ALL_CENTERS}
                  onValueChange={(value) =>
                    setCenterId(value === ALL_CENTERS ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm">
                    <SelectValue placeholder="All centers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CENTERS}>All centers</SelectItem>
                    {centers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Status
                </label>
                <Select
                  value={status || ALL_STATUSES}
                  onValueChange={(value) =>
                    setStatus(value === ALL_STATUSES ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatStatus(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            {(centerId || status || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                className="mt-3 text-sm text-slate-500 hover:text-slate-800 p-0 h-auto"
                onClick={() => {
                  setCenterId("");
                  setStatus("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <CardSkeleton count={10} />
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No orders found matching your filters.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-[#2D3E2D] rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {order.providerFirstname} {order.providerLastname}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {order.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.orderTime).toLocaleDateString(
                              "nl-BE",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          {order.centerName && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {order.centerName}
                            </span>
                          )}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            {order.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400 capitalize">
                          {order.activityType}
                        </span>
                        <Link href={`/manage-orders/${order.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-600 hover:bg-slate-100 h-8 w-8 p-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={goToPage}
                label="orders"
              />
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
