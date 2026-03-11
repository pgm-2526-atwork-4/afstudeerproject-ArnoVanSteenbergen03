"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminOrderById,
  updateAdminOrder,
  getDistributionCenters,
  getUsers,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/loading";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const STATUSES = ["requested", "accepted", "in_progress", "completed", "cancelled"];
const ACTIVITY_TYPES = ["collection", "distribution", "hygiene", "other"];

interface DistroOption {
  id: string;
  name: string;
}

interface VolunteerOption {
  id: string;
  firstname: string;
  lastname: string;
}

export default function EditOrderPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [assignedDriver, setAssignedDriver] = useState<string | null>(null);
  const [assignedCenterId, setAssignedCenterId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [activityType, setActivityType] = useState("");
  const [orderTime, setOrderTime] = useState("");
  const [notes, setNotes] = useState("");

  const [providerName, setProviderName] = useState("");

  const [centers, setCenters] = useState<DistroOption[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchData = async () => {
      try {
        const [orderData, centersData, volunteersData] = await Promise.all([
          getAdminOrderById(orderId),
          getDistributionCenters(),
          getUsers("volunteer"),
        ]);

        const a = orderData.activity;
        setStatus(a.status);
        setAssignedDriver(a.assignedDriver);
        setAssignedCenterId(a.assignedCenterId);
        setLocation(a.location);
        setActivityType(a.activityType);
        setNotes(a.notes || "");

        const dt = new Date(a.orderTime);
        const pad = (n: number) => String(n).padStart(2, "0");
        setOrderTime(
          `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
        );

        if (orderData.provider) {
          setProviderName(
            `${orderData.provider.firstname} ${orderData.provider.lastname}`,
          );
        }

        setCenters(
          centersData.map((c: DistroOption) => ({ id: c.id, name: c.name })),
        );
        setVolunteers(
          volunteersData.map((v: VolunteerOption) => ({
            id: v.id,
            firstname: v.firstname,
            lastname: v.lastname,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, orderId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAdminOrder(orderId, {
        status,
        assignedDriver,
        assignedCenterId,
        location,
        activityType,
        orderTime: new Date(orderTime).toISOString(),
        notes: notes || null,
      });
      setSuccess("Order updated successfully");
      setTimeout(() => router.push("/manage-orders"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const formatStatus = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!user) return null;

  return (
    <ProtectedPage requiredPermission="update_activities">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <Link href="/manage-orders">
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Edit Order</h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2" />
          </div>
          <div className="w-6" />
        </div>

        <div className="max-w-2xl mx-auto w-full">
          {loading ? (
            <LoadingScreen />
          ) : (
            <div className="bg-white border-2 border-slate-800 rounded-lg p-6 space-y-5">
              <div>
                <Label className="text-sm font-medium text-slate-500">Provider</Label>
                <p className="text-slate-800 font-semibold mt-1">{providerName}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm mt-1"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {formatStatus(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Assigned Volunteer
                </Label>
                <select
                  value={assignedDriver ?? ""}
                  onChange={(e) =>
                    setAssignedDriver(e.target.value || null)
                  }
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm mt-1"
                >
                  <option value="">No volunteer assigned</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.firstname} {v.lastname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Distribution Center
                </Label>
                <select
                  value={assignedCenterId ?? ""}
                  onChange={(e) =>
                    setAssignedCenterId(e.target.value || null)
                  }
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm mt-1"
                >
                  <option value="">No center assigned</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Activity Type
                </Label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm mt-1"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Order Time
                </Label>
                <Input
                  type="datetime-local"
                  value={orderTime}
                  onChange={(e) => setOrderTime(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 text-sm mt-1 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-3 text-sm">
                  {success}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
